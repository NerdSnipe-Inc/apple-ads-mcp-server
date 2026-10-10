import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createAppleAdsApi,
  ApiRequestError,
  type AppleAdsApi,
} from "@apple/apple-ads-platform";
import { ConfigError, AppleAdsToolError } from "./errors.js";
import { missingCredentials, type ServerConfig } from "./config.js";
import { redact } from "./redact.js";

export const DEFAULT_BASE_URL = "https://api.ads.apple.com/v1";
export const DEFAULT_AUTH_BASE_URL = "https://appleid.apple.com/";
const TOKEN_PATH = "auth/oauth2/token";

export interface RateLimitState {
  limit?: number;
  remaining?: number;
  /** epoch ms when the current window resets */
  resetAtMs?: number;
  observedAtMs?: number;
  last429?: { atMs: number; retryAfterMs?: number };
}

export interface ClientDeps {
  /** Replace the SDK factory (tests). */
  createApi?: typeof createAppleAdsApi;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  stderr?: (line: string) => void;
}

export interface InvokeOptions {
  /** Safe to retry on 5xx / network failures (reads, PUT, DELETE). 429 is always retried. */
  idempotent: boolean;
}

export interface AdAccountSummary {
  id: string;
  name?: string;
  orgId?: string;
}

const NETWORK_RETRY_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EAI_AGAIN", "EPIPE"]);
const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Normalise APPLE_ADS_BASE_URL: strip trailing slashes (SDK paths already start with "/"). */
export function normalizeBaseUrl(url: string | undefined): string {
  return (url ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
}

/**
 * APPLE_ADS_TOKEN_URL may be an auth base URL ("https://host/") or the full token URL
 * (".../auth/oauth2/token"). The SDK wants the base with a trailing slash.
 */
export function normalizeAuthBaseUrl(url: string | undefined): string {
  if (!url) return DEFAULT_AUTH_BASE_URL;
  let u = url.trim();
  if (u.endsWith(TOKEN_PATH)) u = u.slice(0, -TOKEN_PATH.length);
  return u.endsWith("/") ? u : u + "/";
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined;
  const h = headers as { get?: (n: string) => unknown } & Record<string, unknown>;
  const v = typeof h.get === "function" ? h.get(name) : (h[name] ?? h[name.toLowerCase()]);
  if (v === undefined || v === null) return undefined;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

/** Retry-After is either delta-seconds or an HTTP date. */
export function parseRetryAfter(value: string | undefined, nowMs: number): number | undefined {
  if (!value) return undefined;
  const secs = Number(value);
  if (Number.isFinite(secs) && secs >= 0) return Math.round(secs * 1000);
  const date = Date.parse(value);
  if (!Number.isNaN(date)) return Math.max(0, date - nowMs);
  return undefined;
}

export class AppleAdsClient {
  private apiPromise?: Promise<AppleAdsApi>;
  private aclPromise?: { at: number; p: Promise<AdAccountSummary[]> };
  private mePromise?: Promise<{ userId?: string; orgId?: string }>;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly createApi: typeof createAppleAdsApi;
  private readonly stderr: (line: string) => void;
  readonly rate: RateLimitState = {};

  constructor(
    readonly config: ServerConfig,
    deps: ClientDeps = {}
  ) {
    this.sleep = deps.sleep ?? defaultSleep;
    this.now = deps.now ?? Date.now;
    this.createApi = deps.createApi ?? createAppleAdsApi;
    this.stderr = deps.stderr ?? ((l) => process.stderr.write(l + "\n"));
  }

  /** Values that must never appear in output. */
  secrets(): string[] {
    return [this.config.privateKey, this.config.clientId, this.config.keyId, this.config.teamId].filter(Boolean) as string[];
  }

  // ───────────────────────── authentication / SDK client ─────────────────────────

  /** Lazily build (and memoise) the SDK client. A failed attempt is not cached. */
  getApi(): Promise<AppleAdsApi> {
    if (!this.apiPromise) {
      this.apiPromise = this.buildApi().catch((e) => {
        this.apiPromise = undefined;
        throw e;
      });
    }
    return this.apiPromise;
  }

  /** Drop the cached SDK client (forces a fresh token fetch on next use). */
  resetApi(): void {
    this.apiPromise = undefined;
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string, meta?: unknown): void {
    const order = ["debug", "info", "warn", "error", "silent"];
    if (order.indexOf(level) < order.indexOf(this.config.logLevel)) return;
    const extra = meta === undefined ? "" : " " + redact(meta instanceof Error ? meta.message : meta, this.secrets());
    this.stderr(`[apple-ads-mcp ${level}] ${redact(message, this.secrets())}${extra}`);
  }

  private async buildApi(): Promise<AppleAdsApi> {
    const c = this.config;
    const missing = missingCredentials(c);
    if (missing.length) {
      throw new ConfigError(
        `Apple Ads credentials are not configured. Missing environment variable(s): ${missing.join("; ")}.`,
        "Set them in your MCP client config (env block) or a .env file. See the README section 'Create Apple Ads API credentials'."
      );
    }

    let keyPath = c.privateKeyPath;
    let tmpDir: string | undefined;
    if (keyPath) {
      if (!fs.existsSync(keyPath)) {
        throw new ConfigError(
          `Private key file not found: ${keyPath}`,
          "Check APPLE_ADS_PRIVATE_KEY_PATH (a leading ~ is expanded). Use an absolute path."
        );
      }
    } else {
      // Inline PEM: the SDK's 'key' mode reads a file once at construction time, so we
      // write the key to a 0600 temp file for the duration of createAppleAdsApi() only.
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "apple-ads-key-"));
      keyPath = path.join(tmpDir, "private-key.pem");
      fs.writeFileSync(keyPath, c.privateKey as string, { mode: 0o600 });
    }

    try {
      return await this.createApi({
        authMode: "key",
        clientId: c.clientId as string,
        teamId: c.teamId as string,
        keyId: c.keyId as string,
        privateKeyPath: keyPath,
        baseUrl: normalizeBaseUrl(c.baseUrl),
        authBaseUrl: normalizeAuthBaseUrl(c.tokenUrl),
        apiTimeout: c.timeoutMs,
        authTimeout: c.timeoutMs,
        // The SDK's default logger is `console`, which writes to stdout and would corrupt
        // the stdio MCP stream. Route everything to stderr, redacted.
        logger: {
          debug: (m, meta) => this.log("debug", m, meta),
          info: (m, meta) => this.log("info", m, meta),
          warn: (m, meta) => this.log("warn", m, meta),
          error: (m, meta) => this.log("error", m, meta),
        },
        requestLogLevel: "debug",
        errorLogLevel: "debug",
        apiAxiosCustomizer: (instance) => {
          // Registered before the SDK's own interceptors, so it sees the raw axios
          // response/error (with headers) before the SDK flattens errors.
          instance.interceptors.response.use(
            (res) => {
              this.observe(res.headers, res.status);
              return res;
            },
            (err) => {
              if (err?.response) this.observe(err.response.headers, err.response.status);
              return Promise.reject(err);
            }
          );
        },
      });
    } finally {
      if (tmpDir) {
        try {
          fs.unlinkSync(keyPath as string);
          fs.rmdirSync(tmpDir);
        } catch {
          /* best effort */
        }
      }
    }
  }

  // ───────────────────────── rate limiting ─────────────────────────

  /** Record RateLimit-* / Retry-After headers from any response. */
  observe(headers: unknown, status: number): void {
    const now = this.now();
    const limit = Number(headerValue(headers, "RateLimit-Limit"));
    const remaining = Number(headerValue(headers, "RateLimit-Remaining"));
    const reset = Number(headerValue(headers, "RateLimit-Reset"));
    if (Number.isFinite(limit)) this.rate.limit = limit;
    if (Number.isFinite(remaining)) this.rate.remaining = remaining;
    if (Number.isFinite(reset)) this.rate.resetAtMs = now + reset * 1000;
    this.rate.observedAtMs = now;
    if (status === 429) {
      const retryAfter = parseRetryAfter(headerValue(headers, "Retry-After"), now);
      const resetMs = Number.isFinite(reset) ? reset * 1000 : undefined;
      this.rate.last429 = { atMs: now, retryAfterMs: retryAfter ?? resetMs };
    }
  }

  private async throttle(): Promise<void> {
    if (!this.config.proactiveThrottle) return;
    const { remaining, resetAtMs } = this.rate;
    if (remaining !== undefined && remaining <= 0 && resetAtMs !== undefined) {
      const wait = resetAtMs - this.now();
      if (wait > 0) {
        const capped = Math.min(wait, 30_000);
        this.log("info", `rate limit window exhausted; pausing ${capped}ms`);
        await this.sleep(capped);
      }
    }
  }

  private backoffMs(attempt: number): number {
    const { retryBaseMs, retryMaxMs } = this.config;
    return Math.min(retryBaseMs * 2 ** attempt, retryMaxMs);
  }

  /**
   * Run `fn` with 429 / 5xx / network retries.
   * - 401 is handled inside the SDK (token refresh + one retry).
   * - 429 always retries, honouring Retry-After (then RateLimit-Reset, then capped exponential backoff).
   * - 5xx and transient network errors retry only when `idempotent`.
   */
  async withRetries<T>(fn: () => Promise<T>, opts: InvokeOptions): Promise<T> {
    const max = this.config.maxRetries;
    for (let attempt = 0; ; attempt++) {
      await this.throttle();
      const startedAt = this.now();
      try {
        return await fn();
      } catch (e) {
        const err = e as { status?: number; code?: string; name?: string };
        const isApi = e instanceof ApiRequestError || err?.name === "ApiRequestError";
        if (!isApi || attempt >= max) throw e;
        let wait: number | undefined;
        if (err.status === 429) {
          const rl = this.rate.last429;
          const hinted = rl && rl.atMs >= startedAt ? rl.retryAfterMs : undefined;
          // Retry-After (or RateLimit-Reset) is authoritative; otherwise capped exponential backoff.
          wait = hinted !== undefined ? Math.min(hinted, 120_000) : this.backoffMs(attempt);
        } else if (opts.idempotent && err.status !== undefined && err.status >= 500 && err.status !== 501) {
          wait = this.backoffMs(attempt);
        } else if (opts.idempotent && err.status === undefined && err.code && NETWORK_RETRY_CODES.has(err.code)) {
          wait = this.backoffMs(attempt);
        }
        if (wait === undefined) throw e;
        this.log("warn", `retrying after ${err.status ?? err.code} (attempt ${attempt + 1}/${max}) in ${wait}ms`);
        await this.sleep(wait);
        // The wait already covered the exhausted window; do not pause a second time proactively.
        if (err.status === 429) this.rate.remaining = undefined;
      }
    }
  }

  // ───────────────────────── SDK invocation ─────────────────────────

  /** Call an SDK operation by its method name with positional SDK arguments. */
  async invoke(operationId: string, args: unknown[], opts: InvokeOptions): Promise<{ status: number; data: unknown }> {
    const api = await this.getApi();
    const fn = (api as unknown as Record<string, unknown>)[operationId];
    if (typeof fn !== "function") throw new AppleAdsToolError(`SDK operation ${operationId} does not exist`, { code: "UNKNOWN_OPERATION" });
    const res = (await this.withRetries(() => (fn as (...a: unknown[]) => Promise<{ status: number; data: unknown }>).apply(api, args), opts)) as {
      status: number;
      data: unknown;
    };
    return { status: res.status, data: res.data };
  }

  /** Raw authenticated request through the SDK's axios instance (auth + 401 refresh + error mapping included). */
  async raw(
    method: string,
    apiPath: string,
    o: { query?: Record<string, unknown>; body?: unknown; context?: string }
  ): Promise<{ status: number; data: unknown }> {
    const api = await this.getApi();
    const a = api as unknown as {
      axios: { request: (cfg: Record<string, unknown>) => Promise<{ status: number; data: unknown }> };
      basePath: string;
    };
    const idempotent = ["GET", "PUT", "DELETE", "HEAD"].includes(method) || (method === "POST" && /\/query$/.test(apiPath));
    const headers: Record<string, string> = { Accept: "application/json" };
    if (o.context) headers["X-Ap-Context"] = o.context;
    if (o.body !== undefined) headers["Content-Type"] = "application/json";
    const res = await this.withRetries(
      () =>
        a.axios.request({
          method,
          url: a.basePath.replace(/\/+$/, "") + apiPath,
          params: o.query,
          data: o.body,
          headers,
        }),
      { idempotent }
    );
    return { status: res.status, data: res.data };
  }

  // ───────────────────────── context resolution ─────────────────────────

  /** "123" -> "adAccountId=123"; an explicit "adAccountId=123" / "orgId=..." string passes through. */
  static formatContext(id: string | number): string {
    const s = String(id).trim();
    return s.includes("=") ? s.replace(/;+\s*$/, "") : `adAccountId=${s}`;
  }

  /** Extract the numeric/string ad account id from a context header value. */
  static adAccountIdFromContext(ctx: string | undefined): string | undefined {
    if (!ctx) return undefined;
    const m = ctx.match(/adAccountId\s*=\s*([^;,\s]+)/);
    return m ? m[1] : undefined;
  }

  /** Ad accounts the API user can access (GET /acls), cached for 5 minutes. */
  async listAdAccounts(): Promise<AdAccountSummary[]> {
    const nowMs = this.now();
    if (!this.aclPromise || nowMs - this.aclPromise.at > 5 * 60_000) {
      const p = this.invoke("getUserAcls", [], { idempotent: true }).then((res) => {
        const acls = ((res.data as { result?: { acls?: Array<{ adAccount?: { id?: unknown; name?: string; orgId?: unknown } }> } })?.result?.acls ?? []);
        return acls
          .filter((a) => a.adAccount?.id !== undefined)
          .map((a) => ({
            id: String(a.adAccount?.id),
            name: a.adAccount?.name,
            orgId: a.adAccount?.orgId !== undefined ? String(a.adAccount.orgId) : undefined,
          }));
      });
      p.catch(() => {
        if (this.aclPromise?.p === p) this.aclPromise = undefined;
      });
      this.aclPromise = { at: nowMs, p };
    }
    return this.aclPromise.p;
  }

  /**
   * Resolve the X-AP-Context header value.
   * explicit arg -> APPLE_ADS_AD_ACCOUNT_ID -> (if `required`) the only accessible ad account
   * (narrowed by APPLE_ADS_ORG_ID when set).
   */
  async resolveContext(adAccountId: string | number | undefined, required: boolean): Promise<string | undefined> {
    const explicit = adAccountId ?? this.config.adAccountId;
    if (explicit !== undefined && String(explicit).trim() !== "") return AppleAdsClient.formatContext(explicit);
    if (!required) return undefined;

    const all = await this.listAdAccounts();
    const candidates = this.config.orgId ? all.filter((a) => !a.orgId || a.orgId === this.config.orgId) : all;
    if (candidates.length === 1) return AppleAdsClient.formatContext(candidates[0].id);
    const list = candidates.map((a) => `${a.id}${a.name ? ` (${a.name})` : ""}`).join(", ");
    if (candidates.length === 0) {
      throw new AppleAdsToolError("No ad account is accessible to this API user, so no X-AP-Context can be chosen.", {
        code: "NO_AD_ACCOUNT",
        hint: "Create an ad account (apple_ads_create_ad_account) or ask an Apple Ads admin to grant your API user access, then set APPLE_ADS_AD_ACCOUNT_ID.",
      });
    }
    throw new AppleAdsToolError(`This API user can access several ad accounts: ${list}. Pass adAccountId or set APPLE_ADS_AD_ACCOUNT_ID.`, {
      code: "AMBIGUOUS_AD_ACCOUNT",
      details: { adAccounts: candidates },
    });
  }

  /** orgId argument -> APPLE_ADS_ORG_ID -> orgId from GET /me. */
  async resolveOrgId(orgId: string | number | undefined): Promise<string> {
    const explicit = orgId ?? this.config.orgId;
    if (explicit !== undefined && String(explicit).trim() !== "") return String(explicit);
    if (!this.mePromise) {
      const p = this.invoke("getMe", [], { idempotent: true }).then((r) => {
        const result = (r.data as { result?: { userId?: unknown; orgId?: unknown } })?.result ?? {};
        return { userId: result.userId !== undefined ? String(result.userId) : undefined, orgId: result.orgId !== undefined ? String(result.orgId) : undefined };
      });
      p.catch(() => {
        if (this.mePromise === p) this.mePromise = undefined;
      });
      this.mePromise = p;
    }
    const me = await this.mePromise;
    if (!me.orgId) throw new AppleAdsToolError("Could not determine the orgId from GET /me. Pass orgId explicitly.", { code: "NO_ORG" });
    return me.orgId;
  }
}
