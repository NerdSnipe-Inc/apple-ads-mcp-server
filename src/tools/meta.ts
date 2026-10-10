import { z } from "zod";
import { AppleAdsClient } from "../client.js";
import { AppleAdsToolError, formatError } from "../errors.js";
import { GROUP_NAMES } from "../config.js";
import { SERVER_VERSION, SDK_VERSION } from "../version.js";
import type { ToolContext, ToolDef } from "../types.js";

/** True for requests that cannot change state (GET, and the POST ".../query" style lookups). */
export function isReadRequest(method: string, apiPath: string): boolean {
  const m = method.toUpperCase();
  if (m === "GET" || m === "HEAD") return true;
  return m === "POST" && (/\/query$/.test(apiPath) || apiPath === "/search/geo");
}

/** Normalise a user-supplied API path: must be a relative v1 path, never a full URL. */
export function normalizeApiPath(input: string): string {
  let p = input.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(p) || p.startsWith("//")) {
    throw new AppleAdsToolError("path must be a relative Platform API path such as /campaigns/query (full URLs are not allowed).", { code: "INVALID_INPUT" });
  }
  if (/[?#]/.test(p)) throw new AppleAdsToolError("Put query-string parameters in the 'query' argument, not in path.", { code: "INVALID_INPUT" });
  if (p.split("/").some((seg) => seg === ".." || seg === ".")) throw new AppleAdsToolError("path must not contain '.' or '..' segments.", { code: "INVALID_INPUT" });
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/^\/v1(?=\/|$)/, "");
  return p === "" ? "/" : p;
}

const requestTool: ToolDef = {
  name: "apple_ads_request",
  group: "meta",
  description:
    "Escape hatch: send an authenticated request to any Apple Ads Platform API v1 path. Use it for endpoints newer than this server's pinned SDK or for unusual parameters. " +
    "path is relative to https://api.ads.apple.com/v1 (e.g. /campaigns/query); a leading /v1 is accepted. Query-string parameters go in `query`, the JSON payload in `body`. " +
    "X-AP-Context is added from adAccountId (or APPLE_ADS_AD_ACCOUNT_ID) unless noContext is true; org-level paths (/me, /acls, /orgs/{id}, /advertiser-resources, POST /ad-accounts) need no context. " +
    "Auth, 401 refresh and 429/5xx retries are handled. Under APPLE_ADS_READ_ONLY only GET and POST .../query (and POST /search/geo) are allowed.",
  inputSchema: z
    .object({
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).describe("HTTP method."),
      path: z.string().min(1).describe("API path relative to the v1 base, e.g. /campaigns/query or /ad-accounts/123."),
      query: z.record(z.any()).optional().describe("Query-string parameters as an object. Arrays are sent as repeated keys."),
      body: z.any().optional().describe("JSON request body for POST/PUT/PATCH."),
      adAccountId: z
        .preprocess((v) => (typeof v === "number" ? String(v) : v), z.string().min(1))
        .optional()
        .describe("Ad account for the X-AP-Context header. Defaults to APPLE_ADS_AD_ACCOUNT_ID. A full 'adAccountId=123' context string is also accepted."),
      noContext: z.boolean().optional().describe("Do not send X-AP-Context (org-level endpoints)."),
    })
    .strict(),
  annotations: { title: "Raw Apple Ads API request", readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  meta: { method: "ANY", path: "*", kind: "meta" },
  readOnlySafe: true,
  handler: async (args, ctx: ToolContext) => {
    const method = String(args.method).toUpperCase();
    const apiPath = normalizeApiPath(String(args.path));
    if (ctx.config.readOnly && !isReadRequest(method, apiPath)) {
      throw new AppleAdsToolError(`APPLE_ADS_READ_ONLY is enabled: ${method} ${apiPath} would modify data and is blocked.`, {
        code: "READ_ONLY",
        hint: "Allowed in read-only mode: GET and POST .../query lookups.",
      });
    }
    const explicit = (args.adAccountId as string | undefined) ?? ctx.config.adAccountId;
    const context = args.noContext ? undefined : explicit ? AppleAdsClient.formatContext(explicit) : undefined;
    const res = await ctx.client.raw(method, apiPath, { query: args.query as Record<string, unknown> | undefined, body: args.body, context });
    if (res.data === undefined || res.data === null || res.data === "") return JSON.stringify({ ok: true, status: res.status }, null, 2);
    return typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2);
  },
};

const listOperationsTool: ToolDef = {
  name: "apple_ads_list_operations",
  group: "meta",
  description:
    "List every Apple Ads Platform API operation covered by this server: SDK operation id, HTTP route, tool name, group, kind (read/create/update/delete/action) and whether the tool is currently enabled " +
    "(it may be hidden by APPLE_ADS_READ_ONLY or the group filters). Use it to discover which tool to call.",
  inputSchema: z
    .object({
      group: z.string().optional().describe(`Only operations in this group. One of: ${GROUP_NAMES.join(", ")}.`),
      kind: z.enum(["read", "create", "update", "delete", "action", "meta"]).optional().describe("Only operations of this kind."),
      search: z.string().optional().describe("Case-insensitive substring matched against tool name, operation id and path."),
      includeDisabled: z.boolean().optional().describe("Include tools that are currently disabled (default true)."),
    })
    .strict(),
  annotations: { title: "List operations", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  meta: { method: "-", path: "-", kind: "meta" },
  readOnlySafe: true,
  handler: async (args, ctx) => {
    const snap = ctx.registry();
    const enabled = new Set(snap.enabled.map((t) => t.name));
    const needle = typeof args.search === "string" ? args.search.toLowerCase() : undefined;
    const rows = snap.all
      .filter((t) => (args.group ? t.group === args.group : true))
      .filter((t) => (args.kind ? t.meta.kind === args.kind : true))
      .filter((t) => (args.includeDisabled === false ? enabled.has(t.name) : true))
      .filter((t) => (needle ? `${t.name} ${t.meta.operationId ?? ""} ${t.meta.path}`.toLowerCase().includes(needle) : true))
      .map((t) => ({
        tool: t.name,
        operationId: t.meta.operationId ?? null,
        method: t.meta.method,
        path: t.meta.path,
        group: t.group,
        kind: t.meta.kind,
        readOnly: t.annotations.readOnlyHint,
        enabled: enabled.has(t.name),
        summary: t.description.split("\n")[0],
      }));
    const groups: Record<string, number> = {};
    for (const r of rows) groups[r.group] = (groups[r.group] ?? 0) + 1;
    return JSON.stringify({ count: rows.length, totalTools: snap.all.length, enabledTools: snap.enabled.length, perGroup: groups, operations: rows }, null, 2);
  },
};

const serverStatusTool: ToolDef = {
  name: "apple_ads_server_status",
  group: "meta",
  description:
    "Diagnostics: server and SDK versions, which credentials are configured (values are never shown), default ad account/org, safety switches, enabled tool counts and the latest observed rate-limit headers. " +
    "Set verify=true to actually authenticate with Apple and call GET /me.",
  inputSchema: z
    .object({
      verify: z.boolean().optional().describe("When true, obtain an access token and call GET /me to prove the credentials work."),
    })
    .strict(),
  annotations: { title: "Server status", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  meta: { method: "-", path: "-", kind: "meta" },
  readOnlySafe: true,
  handler: async (args, ctx) => {
    const c = ctx.config;
    const snap = ctx.registry();
    const out: Record<string, unknown> = {
      server: { name: "@nerdsnipe-inc/apple-ads-mcp-server", version: SERVER_VERSION },
      sdk: { name: "@apple/apple-ads-platform", version: SDK_VERSION },
      credentials: {
        clientId: Boolean(c.clientId),
        teamId: Boolean(c.teamId),
        keyId: Boolean(c.keyId),
        privateKey: c.privateKeyPath ? `file: ${c.privateKeyPath}` : c.privateKey ? "inline PEM (APPLE_ADS_PRIVATE_KEY)" : false,
      },
      defaults: { adAccountId: c.adAccountId ?? null, orgId: c.orgId ?? null },
      safety: { readOnly: c.readOnly, enabledGroups: c.enabledGroups ?? "all", disabledGroups: c.disabledGroups },
      tools: { total: snap.all.length, enabled: snap.enabled.length, disabled: snap.disabled.length },
      endpoints: { baseUrl: c.baseUrl ?? "https://api.ads.apple.com/v1 (default)", tokenUrl: c.tokenUrl ?? "https://appleid.apple.com (default)" },
      rateLimit: {
        limit: ctx.client.rate.limit ?? null,
        remaining: ctx.client.rate.remaining ?? null,
        resetsInSeconds: ctx.client.rate.resetAtMs ? Math.max(0, Math.round((ctx.client.rate.resetAtMs - Date.now()) / 1000)) : null,
      },
    };
    if (args.verify) {
      try {
        const res = await ctx.client.invoke("getMe", [], { idempotent: true });
        out.verify = { ok: true, me: (res.data as { result?: unknown })?.result ?? res.data };
      } catch (e) {
        out.verify = { ok: false, error: JSON.parse(formatError(e, ctx.client.secrets())) };
      }
    }
    return JSON.stringify(out, null, 2);
  },
};

export const metaTools: ToolDef[] = [requestTool, listOperationsTool, serverStatusTool];
