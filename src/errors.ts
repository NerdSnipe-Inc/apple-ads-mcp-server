import { redact } from "./redact.js";

export interface ToolErrorOptions {
  code?: string;
  status?: number;
  details?: unknown;
  hint?: string;
}

/** An error whose message is safe and intended to be shown to the caller. */
export class AppleAdsToolError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly details?: unknown;
  readonly hint?: string;

  constructor(message: string, opts: ToolErrorOptions = {}) {
    super(message);
    this.name = "AppleAdsToolError";
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
    this.hint = opts.hint;
  }
}

/** Thrown when credentials / configuration are missing or unusable. */
export class ConfigError extends AppleAdsToolError {
  constructor(message: string, hint?: string) {
    super(message, { code: "CONFIG_ERROR", hint });
    this.name = "ConfigError";
  }
}

const STATUS_HINTS: Record<number, string> = {
  400: "The request was rejected as malformed. Check the details for the offending field.",
  401: "Apple rejected the access token even after a forced refresh. Verify clientId/teamId/keyId and that the private key matches the public key uploaded under Account Settings > API.",
  403: "The API user's role lacks permission for this operation, or the X-AP-Context ad account is not accessible. Call apple_ads_get_user_acls to see accessible ad accounts and roles.",
  404: "The resource does not exist in this ad account (or the ID is wrong). Check adAccountId and the entity ID.",
  429: "Rate limit exceeded and retries were exhausted. Wait for the RateLimit-Reset window and slow down (use bulk endpoints to batch).",
};

interface ErrorShape {
  name?: string;
  message?: string;
  status?: number;
  statusText?: string;
  code?: string;
  data?: unknown;
  method?: string;
  url?: string;
  cause?: { message?: string };
}

/** Extract Apple's { error: { code, message, details } } envelope if present. */
function appleError(data: unknown): { code?: string; message?: string; details?: unknown } | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  const err = (d.error ?? d) as Record<string, unknown>;
  if (err && typeof err === "object" && ("code" in err || "message" in err || "details" in err)) {
    return {
      code: typeof err.code === "string" ? err.code : undefined,
      message: typeof err.message === "string" ? err.message : undefined,
      details: err.details,
    };
  }
  return undefined;
}

/**
 * Turn any thrown value into the JSON text returned to the model. Secrets are redacted.
 * Pass the configured secrets so literal values are scrubbed as well.
 */
export function formatError(e: unknown, secrets: Array<string | undefined> = []): string {
  const err = (e ?? {}) as ErrorShape & { hint?: string; details?: unknown };
  const out: Record<string, unknown> = { error: true };

  if (e instanceof AppleAdsToolError) {
    out.message = e.message;
    if (e.code) out.code = e.code;
    if (e.status) out.status = e.status;
    if (e.details !== undefined) out.details = e.details;
    if (e.hint) out.hint = e.hint;
  } else if (err.name === "ApiRequestError") {
    const apple = appleError(err.data);
    out.message = `Apple Ads API ${err.status ?? ""} ${err.method ?? ""} ${err.url ?? ""}: ${apple?.message ?? err.message ?? "request failed"}`
      .replace(/\s+/g, " ")
      .trim();
    if (err.status) out.status = err.status;
    out.code = apple?.code ?? err.code;
    if (apple?.details !== undefined) out.details = apple.details;
    else if (err.data !== undefined && err.data !== "") out.details = err.data;
    const hint = err.status ? STATUS_HINTS[err.status] : undefined;
    if (hint) out.hint = hint;
    else if (!err.status) out.hint = "No HTTP response was received (network, DNS, proxy or timeout). Check connectivity and APPLE_ADS_TIMEOUT_MS.";
  } else if (err.name === "AccessTokenFetchError" || err.name === "ClientSecretError") {
    out.message =
      err.name === "ClientSecretError"
        ? `Could not build the client secret from your private key: ${err.message}`
        : `Authentication with Apple failed: ${err.message}`;
    out.code = err.name === "ClientSecretError" ? "CLIENT_SECRET_ERROR" : "AUTH_FAILED";
    out.hint =
      "Verify APPLE_ADS_CLIENT_ID / TEAM_ID / KEY_ID, that the private key is the ES256 (prime256v1) key whose public half is uploaded under Account Settings > API in Apple Ads, and that the API user has an API role.";
  } else {
    out.message = err.message ?? String(e);
  }

  return redact(JSON.stringify(out, null, 2), secrets);
}
