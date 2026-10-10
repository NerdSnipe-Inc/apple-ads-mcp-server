import os from "node:os";
import path from "node:path";

/** Names of every tool group. Kept in sync with scripts/curated.mjs (checked by tests). */
export const GROUP_NAMES = [
  "accounts",
  "apps",
  "eligibility",
  "brands",
  "location_groups",
  "campaigns",
  "ad_groups",
  "ads",
  "creatives",
  "assets",
  "keywords",
  "negative_keywords",
  "bulk",
  "geo",
  "product_pages",
  "budget_orders",
  "reports_apps",
  "reports_brands",
  "insights",
  "recommendations",
  "suggestions",
  "change_history",
  "meta",
] as const;

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface ServerConfig {
  clientId?: string;
  teamId?: string;
  keyId?: string;
  /** Path to the .pem private key (~ expanded). */
  privateKeyPath?: string;
  /** Inline PEM private key (alternative to a path). */
  privateKey?: string;
  /** Default ad account (X-AP-Context: adAccountId=...). */
  adAccountId?: string;
  /** Default organization. Used by apple_ads_get_org and to narrow ad account auto-discovery. */
  orgId?: string;
  readOnly: boolean;
  enabledGroups?: string[];
  disabledGroups: string[];
  /** TEST-ONLY: override https://api.ads.apple.com/v1 */
  baseUrl?: string;
  /** TEST-ONLY: override https://appleid.apple.com/ (or the full token URL). */
  tokenUrl?: string;
  timeoutMs: number;
  maxRetries: number;
  retryBaseMs: number;
  retryMaxMs: number;
  proactiveThrottle: boolean;
  logLevel: LogLevel;
}

export interface LoadedConfig {
  config: ServerConfig;
  /** Environment variables that must be set for API calls to work (empty when fully configured). */
  missing: string[];
  /** Non-fatal configuration problems (unknown group names, bad numbers, ...). */
  problems: string[];
}

type Env = Record<string, string | undefined>;

/** First non-empty value among the given variable names. */
function pick(env: Env, ...names: string[]): string | undefined {
  for (const n of names) {
    const v = env[n]?.trim();
    if (v) return v;
  }
  return undefined;
}

function parseBool(v: string | undefined, dflt: boolean): boolean {
  if (v === undefined) return dflt;
  return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
}

function parseIntEnv(env: Env, name: string, dflt: number, problems: string[], min = 0): number {
  const raw = env[name]?.trim();
  if (!raw) return dflt;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min) {
    problems.push(`${name}="${raw}" is not a valid number >= ${min}; using ${dflt}`);
    return dflt;
  }
  return Math.floor(n);
}

export function parseGroupList(raw: string | undefined, problems: string[], varName: string): string[] | undefined {
  if (!raw || !raw.trim()) return undefined;
  const out = raw
    .split(/[,\s]+/)
    .map((g) => g.trim().toLowerCase().replace(/-/g, "_"))
    .filter(Boolean);
  for (const g of out) {
    if (!(GROUP_NAMES as readonly string[]).includes(g)) {
      problems.push(`${varName} contains unknown group "${g}". Known groups: ${GROUP_NAMES.join(", ")}`);
    }
  }
  return out;
}

/** Expand a leading ~ to the home directory. */
export function expandHome(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/") || p.startsWith("~\\")) return path.join(os.homedir(), p.slice(2));
  return p;
}

/** Normalise a PEM supplied through an environment variable (handles literal "\n"). */
export function normalizePem(raw: string): string {
  let pem = raw.trim();
  if (pem.includes("\\n")) pem = pem.replace(/\\n/g, "\n");
  return pem.endsWith("\n") ? pem : pem + "\n";
}

export function loadConfig(env: Env = process.env): LoadedConfig {
  const problems: string[] = [];

  const clientId = pick(env, "APPLE_ADS_CLIENT_ID", "ASA_CLIENT_ID");
  const teamId = pick(env, "APPLE_ADS_TEAM_ID", "ASA_TEAM_ID");
  const keyId = pick(env, "APPLE_ADS_KEY_ID", "ASA_KEY_ID");
  const rawPath = pick(env, "APPLE_ADS_PRIVATE_KEY_PATH", "ASA_PRIVATE_KEY_PATH");
  const rawKey = pick(env, "APPLE_ADS_PRIVATE_KEY", "ASA_PRIVATE_KEY");
  const adAccountId = pick(env, "APPLE_ADS_AD_ACCOUNT_ID", "ASA_AD_ACCOUNT_ID");
  const orgId = pick(env, "APPLE_ADS_ORG_ID", "ASA_ORG_ID");

  const privateKeyPath = rawPath ? expandHome(rawPath) : undefined;
  const privateKey = rawKey ? normalizePem(rawKey) : undefined;

  const logLevelRaw = (pick(env, "APPLE_ADS_LOG_LEVEL") ?? "warn").toLowerCase();
  const logLevel = (["debug", "info", "warn", "error", "silent"].includes(logLevelRaw) ? logLevelRaw : "warn") as LogLevel;
  if (logLevel !== logLevelRaw) problems.push(`APPLE_ADS_LOG_LEVEL="${logLevelRaw}" is invalid; using "warn"`);

  const config: ServerConfig = {
    clientId,
    teamId,
    keyId,
    privateKeyPath,
    privateKey,
    adAccountId,
    orgId,
    readOnly: parseBool(env.APPLE_ADS_READ_ONLY, false),
    enabledGroups: parseGroupList(env.APPLE_ADS_ENABLED_GROUPS, problems, "APPLE_ADS_ENABLED_GROUPS"),
    disabledGroups: parseGroupList(env.APPLE_ADS_DISABLED_GROUPS, problems, "APPLE_ADS_DISABLED_GROUPS") ?? [],
    baseUrl: pick(env, "APPLE_ADS_BASE_URL"),
    tokenUrl: pick(env, "APPLE_ADS_TOKEN_URL"),
    timeoutMs: parseIntEnv(env, "APPLE_ADS_TIMEOUT_MS", 30_000, problems, 1),
    maxRetries: parseIntEnv(env, "APPLE_ADS_MAX_RETRIES", 4, problems, 0),
    retryBaseMs: parseIntEnv(env, "APPLE_ADS_RETRY_BASE_MS", 2_000, problems, 0),
    retryMaxMs: parseIntEnv(env, "APPLE_ADS_RETRY_MAX_MS", 16_000, problems, 0),
    proactiveThrottle: parseBool(env.APPLE_ADS_PROACTIVE_THROTTLE, true),
    logLevel,
  };

  return { config, missing: missingCredentials(config), problems };
}

/** Human-readable list of the env vars still needed (primary names with aliases). */
export function missingCredentials(c: Pick<ServerConfig, "clientId" | "teamId" | "keyId" | "privateKeyPath" | "privateKey">): string[] {
  const missing: string[] = [];
  if (!c.clientId) missing.push("APPLE_ADS_CLIENT_ID (alias ASA_CLIENT_ID)");
  if (!c.teamId) missing.push("APPLE_ADS_TEAM_ID (alias ASA_TEAM_ID)");
  if (!c.keyId) missing.push("APPLE_ADS_KEY_ID (alias ASA_KEY_ID)");
  if (!c.privateKeyPath && !c.privateKey) {
    missing.push("APPLE_ADS_PRIVATE_KEY_PATH or APPLE_ADS_PRIVATE_KEY (aliases ASA_PRIVATE_KEY_PATH / ASA_PRIVATE_KEY)");
  }
  return missing;
}
