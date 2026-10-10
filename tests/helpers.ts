import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";

export interface RecordedRequest {
  method: string;
  url: string;
  path: string;
  query: URLSearchParams;
  headers: http.IncomingHttpHeaders;
  rawBody: Buffer;
  body: unknown;
}

export interface MockResponse {
  status?: number;
  headers?: Record<string, string>;
  json?: unknown;
  body?: string;
}

export interface TokenRequest {
  grant_type?: string;
  client_id?: string;
  client_secret?: string;
  scope?: string;
  jwt?: { header: Record<string, unknown>; payload: Record<string, unknown>; signatureValid: boolean };
}

export interface MockApple {
  url: string;
  /** Base URL for APPLE_ADS_BASE_URL */
  apiUrl: string;
  tokenRequests: TokenRequest[];
  requests: RecordedRequest[];
  /** Responses consumed in order by API (non-token) requests; falls back to `handler`. */
  queue: MockResponse[];
  handler: (req: RecordedRequest) => MockResponse;
  tokenStatus: number;
  close(): Promise<void>;
  reset(): void;
}

export interface TestKey {
  privateKeyPem: string;
  publicKeyPem: string;
  keyPath: string;
}

let keyDir: string | undefined;

export function makeKey(): TestKey {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const privateKeyPem = privateKey.export({ type: "sec1", format: "pem" }).toString();
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  keyDir ??= fs.mkdtempSync(path.join(os.tmpdir(), "apple-ads-test-"));
  const keyPath = path.join(keyDir, `key-${crypto.randomBytes(4).toString("hex")}.pem`);
  fs.writeFileSync(keyPath, privateKeyPem, { mode: 0o600 });
  return { privateKeyPem, publicKeyPem, keyPath };
}

const b64urlToBuf = (s: string) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export function decodeJwt(token: string, publicKeyPem: string) {
  const [h, p, s] = token.split(".");
  const header = JSON.parse(b64urlToBuf(h).toString());
  const payload = JSON.parse(b64urlToBuf(p).toString());
  const signatureValid = crypto.verify("sha256", Buffer.from(`${h}.${p}`), { key: publicKeyPem, dsaEncoding: "ieee-p1363" }, b64urlToBuf(s));
  return { header, payload, signatureValid };
}

export async function startMockApple(key: TestKey): Promise<MockApple> {
  const state = { n: 0 };
  const mock: MockApple = {
    url: "",
    apiUrl: "",
    tokenRequests: [],
    requests: [],
    queue: [],
    tokenStatus: 200,
    handler: () => ({ json: { result: { ok: true } } }),
    reset() {
      mock.tokenRequests.length = 0;
      mock.requests.length = 0;
      mock.queue.length = 0;
      mock.tokenStatus = 200;
      state.n = 0;
      mock.handler = () => ({ json: { result: { ok: true } } });
    },
    async close() {
      await new Promise<void>((r) => server.close(() => r()));
    },
  };

  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const rawBody = Buffer.concat(chunks);
      const u = new URL(req.url ?? "/", "http://localhost");

      if (u.pathname === "/auth/oauth2/token") {
        const form = Object.fromEntries(new URLSearchParams(rawBody.toString())) as TokenRequest;
        try {
          if (form.client_secret) form.jwt = decodeJwt(form.client_secret, key.publicKeyPem);
        } catch {
          /* leave undefined */
        }
        mock.tokenRequests.push(form);
        if (mock.tokenStatus !== 200) {
          res.writeHead(mock.tokenStatus, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: "invalid_client" }));
          return;
        }
        state.n++;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ access_token: `tok-${state.n}`, token_type: "Bearer", expires_in: 3600, scope: "searchadsorg" }));
        return;
      }

      let body: unknown = undefined;
      const ct = String(req.headers["content-type"] ?? "");
      if (rawBody.length && ct.includes("json")) {
        try {
          body = JSON.parse(rawBody.toString());
        } catch {
          body = rawBody.toString();
        }
      }
      const recorded: RecordedRequest = { method: req.method ?? "GET", url: req.url ?? "", path: u.pathname, query: u.searchParams, headers: req.headers, rawBody, body };
      mock.requests.push(recorded);
      const r = mock.queue.length ? (mock.queue.shift() as MockResponse) : mock.handler(recorded);
      const status = r.status ?? 200;
      const headers: Record<string, string> = { "content-type": "application/json", ...(r.headers ?? {}) };
      res.writeHead(status, headers);
      if (status === 204) res.end();
      else res.end(r.body ?? JSON.stringify(r.json ?? {}));
    });
  });

  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as AddressInfo).port;
  mock.url = `http://127.0.0.1:${port}`;
  mock.apiUrl = `${mock.url}/v1`;
  return mock;
}

/** Environment for a server pointed at the mock. */
export function mockEnv(mock: MockApple, key: TestKey, extra: Record<string, string> = {}): Record<string, string> {
  return {
    APPLE_ADS_CLIENT_ID: "SEARCHADS.test-client",
    APPLE_ADS_TEAM_ID: "SEARCHADS.test-team",
    APPLE_ADS_KEY_ID: "test-key-id",
    APPLE_ADS_PRIVATE_KEY_PATH: key.keyPath,
    APPLE_ADS_AD_ACCOUNT_ID: "111222",
    APPLE_ADS_BASE_URL: mock.apiUrl,
    APPLE_ADS_TOKEN_URL: mock.url + "/",
    APPLE_ADS_RETRY_BASE_MS: "1",
    APPLE_ADS_RETRY_MAX_MS: "4",
    ...extra,
  };
}
