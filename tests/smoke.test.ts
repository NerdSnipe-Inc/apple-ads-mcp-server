/**
 * Integration smoke test: spawn the BUILT server over stdio and drive it with the MCP SDK
 * client. No real credentials and no Apple servers - API traffic goes to a local mock
 * (APPLE_ADS_BASE_URL / APPLE_ADS_TOKEN_URL are test-only overrides).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { makeKey, mockEnv, startMockApple, type MockApple, type TestKey } from "./helpers.js";

const root = path.resolve(__dirname, "..");
const entry = path.join(root, "dist", "index.js");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs", "coverage.json"), "utf8"));
const text = (r: any): string => r.content[0].text;

let key: TestKey;
let mock: MockApple;
let cwd: string;
const clients: Client[] = [];

async function spawnServer(env: Record<string, string>) {
  const transport = new StdioClientTransport({ command: process.execPath, args: [entry], env, cwd, stderr: "pipe" });
  const client = new Client({ name: "smoke", version: "0.0.0" });
  await client.connect(transport);
  clients.push(client);
  return client;
}

beforeAll(async () => {
  execFileSync(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc")], { cwd: root, stdio: "pipe" });
  key = makeKey();
  mock = await startMockApple(key);
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), "apple-ads-smoke-")); // no .env here
}, 120_000);

afterAll(async () => {
  await Promise.all(clients.map((c) => c.close().catch(() => {})));
  await mock.close();
});

describe("stdio smoke test (built server)", () => {
  it("prints its version", () => {
    const out = execFileSync(process.execPath, [entry, "--version"], { cwd }).toString();
    expect(out).toMatch(/^\d+\.\d+\.\d+ \(sdk 1\.109\.0\)/);
  });

  it("initializes and lists exactly the manifest's tools", async () => {
    const client = await spawnServer(mockEnv(mock, key));
    expect(client.getServerVersion()?.name).toBe("apple-ads-mcp-server");
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(manifest.totals.tools);
    const names = new Set(tools.map((t) => t.name));
    for (const op of manifest.operations) expect(names.has(op.tool), op.tool).toBe(true);
    for (const t of tools) {
      expect(t.name).toMatch(/^[a-z0-9_]{1,64}$/);
      expect(t.inputSchema.type).toBe("object");
      expect(typeof t.annotations?.readOnlyHint).toBe("boolean");
    }
  });

  it("returns an actionable error when credentials are missing", async () => {
    const client = await spawnServer({});
    expect((await client.listTools()).tools).toHaveLength(manifest.totals.tools);
    const res = await client.callTool({ name: "apple_ads_get_user_acls", arguments: {} });
    expect(res.isError).toBe(true);
    const body = JSON.parse(text(res));
    expect(body.message).toContain("credentials are not configured");
    for (const v of ["APPLE_ADS_CLIENT_ID", "APPLE_ADS_TEAM_ID", "APPLE_ADS_KEY_ID", "APPLE_ADS_PRIVATE_KEY_PATH"]) expect(body.message).toContain(v);
    expect(body.hint).toContain("README");
  });

  it("talks to the (mock) API: bearer auth, org context and request shaping for GET/POST/PUT/DELETE/PATCH", async () => {
    mock.reset();
    const client = await spawnServer(mockEnv(mock, key));
    const call = async (name: string, args: Record<string, unknown>) => {
      const r = await client.callTool({ name, arguments: args });
      expect(r.isError, text(r)).toBeFalsy();
      return mock.requests.at(-1)!;
    };

    // GET
    let req = await call("apple_ads_get_campaign", { campaignId: 5 });
    expect([req.method, req.path]).toEqual(["GET", "/v1/campaigns/5"]);
    expect(req.headers.authorization).toBe("Bearer tok-1");
    expect(req.headers["x-ap-context"]).toBe("adAccountId=111222");

    // per-call org/ad-account context
    req = await call("apple_ads_get_campaign", { campaignId: 5, adAccountId: "424242" });
    expect(req.headers["x-ap-context"]).toBe("adAccountId=424242");

    // POST (query)
    req = await call("apple_ads_query_ad_groups", { filters: [{ field: "campaignId", operator: "EQUALS", value: 5 }], pagination: { pageSize: 2 } });
    expect([req.method, req.path]).toEqual(["POST", "/v1/adgroups/query"]);
    expect(req.body).toEqual({ filters: [{ field: "campaignId", operator: "EQUALS", value: 5 }], pagination: { pageSize: 2 } });

    // POST (create)
    req = await call("apple_ads_create_keyword", { body: { adGroupId: 9, text: "photo editor", matchType: "EXACT" } });
    expect([req.method, req.path]).toEqual(["POST", "/v1/keywords"]);
    expect(req.body).toMatchObject({ adGroupId: 9, text: "photo editor", matchType: "EXACT" });

    // PUT
    req = await call("apple_ads_update_keyword", { keywordId: 12, body: { status: "PAUSED" } });
    expect([req.method, req.path]).toEqual(["PUT", "/v1/keywords/12"]);
    expect(req.body).toEqual({ status: "PAUSED" });

    // DELETE
    mock.queue.push({ status: 204 });
    req = await call("apple_ads_delete_keyword", { keywordId: 12 });
    expect([req.method, req.path]).toEqual(["DELETE", "/v1/keywords/12"]);

    // PATCH (raw escape hatch)
    req = await call("apple_ads_request", { method: "PATCH", path: "/v1/campaigns/5", body: { name: "x" } });
    expect([req.method, req.path]).toEqual(["PATCH", "/v1/campaigns/5"]);
    expect(req.body).toEqual({ name: "x" });
    expect(req.headers.authorization).toBe("Bearer tok-1");

    // token fetched exactly once for the whole session
    expect(mock.tokenRequests).toHaveLength(1);
    expect(mock.tokenRequests[0].jwt?.signatureValid).toBe(true);
  });

  it("enforces APPLE_ADS_READ_ONLY and group filters in the spawned server", async () => {
    const ro = await spawnServer(mockEnv(mock, key, { APPLE_ADS_READ_ONLY: "true", APPLE_ADS_ENABLED_GROUPS: "campaigns" }));
    const names = (await ro.listTools()).tools.map((t) => t.name);
    expect(names).toContain("apple_ads_query_campaigns");
    expect(names).not.toContain("apple_ads_create_campaign");
    expect(names).not.toContain("apple_ads_query_keywords");
  });

  it("keeps stdout clean (protocol only) even with request logging enabled", async () => {
    const client = await spawnServer(mockEnv(mock, key, { APPLE_ADS_LOG_LEVEL: "debug" }));
    const r = await client.callTool({ name: "apple_ads_get_me", arguments: {} });
    expect(r.isError).toBeFalsy(); // a stray stdout line would have broken JSON-RPC framing
  });
});
