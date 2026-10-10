import fs from "node:fs";
import os from "node:os";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppleAdsClient, normalizeAuthBaseUrl, normalizeBaseUrl, parseRetryAfter } from "../src/client.js";
import { loadConfig } from "../src/config.js";
import { makeKey, mockEnv, startMockApple, type MockApple, type TestKey } from "./helpers.js";

let key: TestKey;
let mock: MockApple;

beforeAll(async () => {
  key = makeKey();
  mock = await startMockApple(key);
});
afterAll(async () => mock.close());
beforeEach(() => mock.reset());

function makeClient(extraEnv: Record<string, string> = {}) {
  const sleeps: number[] = [];
  const logs: string[] = [];
  const client = new AppleAdsClient(loadConfig(mockEnv(mock, key, extraEnv)).config, {
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    stderr: (l) => logs.push(l),
  });
  return { client, sleeps, logs };
}

describe("authentication", () => {
  it("fetches a token with a correctly-signed ES256 client secret and caches it", async () => {
    const { client } = makeClient();
    await client.invoke("getMe", [], { idempotent: true });
    await client.invoke("getMe", [], { idempotent: true });
    await client.invoke("getUserAcls", [], { idempotent: true });
    expect(mock.tokenRequests).toHaveLength(1);
    const t = mock.tokenRequests[0];
    expect(t.grant_type).toBe("client_credentials");
    expect(t.scope).toBe("searchadsorg");
    expect(t.client_id).toBe("SEARCHADS.test-client");
    expect(t.jwt?.signatureValid).toBe(true);
    expect(t.jwt?.header).toMatchObject({ alg: "ES256", kid: "test-key-id" });
    expect(t.jwt?.payload).toMatchObject({ iss: "SEARCHADS.test-team", sub: "SEARCHADS.test-client", aud: "https://appleid.apple.com" });
    const exp = Number(t.jwt?.payload.exp);
    const iat = Number(t.jwt?.payload.iat);
    expect(exp - iat).toBeGreaterThan(0);
    expect(exp - iat).toBeLessThanOrEqual(180 * 86400);
    expect(mock.requests.every((r) => r.headers.authorization === "Bearer tok-1")).toBe(true);
  });

  it("supports an inline PEM (temp file is removed afterwards)", async () => {
    const before = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith("apple-ads-key-"));
    const { client } = makeClient({ APPLE_ADS_PRIVATE_KEY_PATH: "", APPLE_ADS_PRIVATE_KEY: key.privateKeyPem.replace(/\n/g, "\\n") });
    await client.invoke("getMe", [], { idempotent: true });
    expect(mock.tokenRequests[0].jwt?.signatureValid).toBe(true);
    const after = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith("apple-ads-key-"));
    expect(after.length).toBeLessThanOrEqual(before.length);
  });

  it("refreshes the token once and retries on 401", async () => {
    const { client } = makeClient();
    mock.queue.push({ status: 401, json: { error: { code: "unauthorized" } } }, { json: { result: { userId: 1, orgId: 2 } } });
    const res = await client.invoke("getMe", [], { idempotent: true });
    expect((res.data as any).result.orgId).toBe(2);
    expect(mock.tokenRequests).toHaveLength(2);
    expect(mock.requests).toHaveLength(2);
    expect(mock.requests[0].headers.authorization).toBe("Bearer tok-1");
    expect(mock.requests[1].headers.authorization).toBe("Bearer tok-2");
  });

  it("does not loop forever on persistent 401", async () => {
    const { client } = makeClient();
    mock.handler = () => ({ status: 401, json: { error: { code: "unauthorized", message: "bad token" } } });
    await expect(client.invoke("getMe", [], { idempotent: true })).rejects.toMatchObject({ status: 401 });
    expect(mock.requests).toHaveLength(2);
    expect(mock.tokenRequests).toHaveLength(2);
  });

  it("surfaces a clear, redacted error when Apple rejects the credentials, and recovers later", async () => {
    const { client } = makeClient();
    mock.tokenStatus = 400;
    await expect(client.invoke("getMe", [], { idempotent: true })).rejects.toMatchObject({ name: "AccessTokenFetchError" });
    mock.tokenStatus = 200;
    const res = await client.invoke("getMe", [], { idempotent: true });
    expect(res.status).toBe(200); // failed construction was not cached
  });

  it("reports missing credentials by variable name", async () => {
    const client = new AppleAdsClient(loadConfig({}).config);
    await expect(client.getApi()).rejects.toMatchObject({ name: "ConfigError", message: expect.stringContaining("APPLE_ADS_CLIENT_ID") });
  });

  it("reports a missing key file", async () => {
    const { client } = makeClient({ APPLE_ADS_PRIVATE_KEY_PATH: "/definitely/not/here.pem" });
    await expect(client.getApi()).rejects.toMatchObject({ message: expect.stringContaining("Private key file not found") });
  });
});

describe("rate limiting and retries", () => {
  it("honours Retry-After on 429 and then succeeds", async () => {
    const { client, sleeps } = makeClient();
    mock.queue.push({ status: 429, headers: { "Retry-After": "3", "RateLimit-Limit": "100", "RateLimit-Remaining": "0", "RateLimit-Reset": "9" }, json: { error: { code: "rate_limit_exceeded" } } }, { json: { result: 1 } });
    const res = await client.invoke("getMe", [], { idempotent: false });
    expect(res.status).toBe(200);
    expect(sleeps).toEqual([3000]);
    expect(mock.requests).toHaveLength(2);
  });

  it("falls back to RateLimit-Reset, then to capped exponential backoff", async () => {
    const { client, sleeps } = makeClient({ APPLE_ADS_RETRY_BASE_MS: "2000", APPLE_ADS_RETRY_MAX_MS: "16000", APPLE_ADS_MAX_RETRIES: "6" });
    mock.queue.push(
      { status: 429, headers: { "RateLimit-Reset": "7" } },
      { status: 429 },
      { status: 429 },
      { status: 429 },
      { status: 429 },
      { json: { result: 1 } }
    );
    await client.invoke("getMe", [], { idempotent: false });
    // RateLimit-Reset (7s), then base*2^attempt capped at 16s: 4s, 8s, 16s, 16s
    expect(sleeps).toEqual([7000, 4000, 8000, 16000, 16000]);
  });

  it("gives up after maxRetries with the 429 error", async () => {
    const { client, sleeps } = makeClient({ APPLE_ADS_MAX_RETRIES: "2" });
    mock.handler = () => ({ status: 429, headers: { "Retry-After": "1" }, json: { error: { code: "rate_limit_exceeded" } } });
    await expect(client.invoke("getMe", [], { idempotent: false })).rejects.toMatchObject({ status: 429 });
    expect(mock.requests).toHaveLength(3);
    expect(sleeps).toEqual([1000, 1000]);
  });

  it("retries 5xx for idempotent calls only", async () => {
    const { client, sleeps } = makeClient();
    mock.queue.push({ status: 503 }, { status: 502 }, { json: { result: 1 } });
    await client.invoke("getMe", [], { idempotent: true });
    expect(sleeps).toHaveLength(2);

    mock.reset();
    const second = makeClient();
    mock.queue.push({ status: 503 }, { json: { result: 1 } });
    await expect(second.client.invoke("getMe", [], { idempotent: false })).rejects.toMatchObject({ status: 503 });
    expect(mock.requests).toHaveLength(1);
    expect(second.sleeps).toEqual([]);
  });

  it("does not retry 4xx client errors", async () => {
    const { client } = makeClient();
    mock.queue.push({ status: 400, json: { error: { code: "VALIDATION_ERROR" } } }, { json: {} });
    await expect(client.invoke("getMe", [], { idempotent: true })).rejects.toMatchObject({ status: 400 });
    expect(mock.requests).toHaveLength(1);
  });

  it("records RateLimit headers and pauses proactively when the window is exhausted", async () => {
    const { client, sleeps } = makeClient();
    mock.queue.push({ headers: { "RateLimit-Limit": "100", "RateLimit-Remaining": "0", "RateLimit-Reset": "5" }, json: { result: 1 } });
    await client.invoke("getMe", [], { idempotent: true });
    expect(client.rate.limit).toBe(100);
    expect(client.rate.remaining).toBe(0);
    await client.invoke("getMe", [], { idempotent: true });
    expect(sleeps.length).toBe(1);
    expect(sleeps[0]).toBeGreaterThan(3000);
    expect(sleeps[0]).toBeLessThanOrEqual(5000);
  });

  it("can disable proactive throttling", async () => {
    const { client, sleeps } = makeClient({ APPLE_ADS_PROACTIVE_THROTTLE: "false" });
    mock.queue.push({ headers: { "RateLimit-Remaining": "0", "RateLimit-Reset": "5" }, json: {} });
    await client.invoke("getMe", [], { idempotent: true });
    await client.invoke("getMe", [], { idempotent: true });
    expect(sleeps).toEqual([]);
  });
});

describe("context resolution", () => {
  it("formats the X-AP-Context value", () => {
    expect(AppleAdsClient.formatContext("123")).toBe("adAccountId=123");
    expect(AppleAdsClient.formatContext(123)).toBe("adAccountId=123");
    expect(AppleAdsClient.formatContext("adAccountId=9;")).toBe("adAccountId=9");
    expect(AppleAdsClient.adAccountIdFromContext("adAccountId=77")).toBe("77");
  });

  it("uses explicit arg, then the env default", async () => {
    const { client } = makeClient();
    expect(await client.resolveContext("5", true)).toBe("adAccountId=5");
    expect(await client.resolveContext(undefined, true)).toBe("adAccountId=111222");
  });

  it("auto-discovers the only accessible ad account and narrows by orgId", async () => {
    const acl = (id: number, orgId: number) => ({ adAccount: { id, name: `acct${id}`, orgId }, roles: ["Admin"] });
    let { client } = makeClient({ APPLE_ADS_AD_ACCOUNT_ID: "" });
    mock.handler = () => ({ json: { result: { acls: [acl(1, 10)] } } });
    expect(await client.resolveContext(undefined, true)).toBe("adAccountId=1");
    expect(await client.resolveContext(undefined, false)).toBeUndefined(); // optional contexts never auto-discover
  });

  it("errors with the candidate list when ambiguous and filters by APPLE_ADS_ORG_ID", async () => {
    const acls = [
      { adAccount: { id: 1, name: "A", orgId: 10 }, roles: [] },
      { adAccount: { id: 2, name: "B", orgId: 20 }, roles: [] },
    ];
    mock.handler = () => ({ json: { result: { acls } } });
    const ambiguous = makeClient({ APPLE_ADS_AD_ACCOUNT_ID: "" }).client;
    await expect(ambiguous.resolveContext(undefined, true)).rejects.toMatchObject({ code: "AMBIGUOUS_AD_ACCOUNT", message: expect.stringContaining("1 (A), 2 (B)") });
    const narrowed = makeClient({ APPLE_ADS_AD_ACCOUNT_ID: "", APPLE_ADS_ORG_ID: "20" }).client;
    expect(await narrowed.resolveContext(undefined, true)).toBe("adAccountId=2");
  });

  it("does not auto-discover for optional contexts", async () => {
    const { client } = makeClient({ APPLE_ADS_AD_ACCOUNT_ID: "" });
    expect(await client.resolveContext(undefined, false)).toBeUndefined();
    expect(mock.requests).toHaveLength(0);
  });

  it("resolves the org from env, then from GET /me", async () => {
    expect(await makeClient({ APPLE_ADS_ORG_ID: "55" }).client.resolveOrgId(undefined)).toBe("55");
    expect(await makeClient().client.resolveOrgId("66")).toBe("66");
    mock.handler = () => ({ json: { result: { userId: 1, orgId: 77 } } });
    expect(await makeClient().client.resolveOrgId(undefined)).toBe("77");
  });
});

describe("helpers", () => {
  it("normalises URLs", () => {
    expect(normalizeBaseUrl("http://x/v1/")).toBe("http://x/v1");
    expect(normalizeBaseUrl(undefined)).toBe("https://api.ads.apple.com/v1");
    expect(normalizeAuthBaseUrl("http://x")).toBe("http://x/");
    expect(normalizeAuthBaseUrl("http://x/auth/oauth2/token")).toBe("http://x/");
    expect(normalizeAuthBaseUrl(undefined)).toBe("https://appleid.apple.com/");
  });

  it("parses Retry-After seconds and dates", () => {
    expect(parseRetryAfter("5", 0)).toBe(5000);
    expect(parseRetryAfter(new Date(10_000).toUTCString(), 4_000)).toBe(6000);
    expect(parseRetryAfter("nonsense", 0)).toBeUndefined();
    expect(parseRetryAfter(undefined, 0)).toBeUndefined();
  });
});
