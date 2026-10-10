import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { createAppleAdsServer } from "../src/server.js";
import { makeKey, mockEnv, startMockApple, type MockApple, type TestKey } from "./helpers.js";

let key: TestKey;
let mock: MockApple;

beforeAll(async () => {
  key = makeKey();
  mock = await startMockApple(key);
});
afterAll(async () => mock.close());
beforeEach(() => mock.reset());

function app(extra: Record<string, string> = {}) {
  return createAppleAdsServer({
    config: loadConfig(mockEnv(mock, key, extra)).config,
    clientDeps: { sleep: async () => {}, stderr: () => {} },
  });
}
const last = () => mock.requests.at(-1)!;
const json = (text: string) => JSON.parse(text);

describe("GET", () => {
  it("renames the path id, sends auth + context, returns the response body", async () => {
    mock.handler = () => ({ json: { result: { id: 55, name: "Spring" } } });
    const r = await app().callTool("apple_ads_get_campaign", { campaignId: 55 });
    expect(r.isError).toBe(false);
    expect(json(r.text)).toEqual({ result: { id: 55, name: "Spring" } });
    expect(last().method).toBe("GET");
    expect(last().path).toBe("/v1/campaigns/55");
    expect(last().headers.authorization).toBe("Bearer tok-1");
    expect(last().headers["x-ap-context"]).toBe("adAccountId=111222");
  });

  it("per-call adAccountId overrides the default (multi-account)", async () => {
    await app().callTool("apple_ads_get_campaign", { campaignId: "1", adAccountId: 999 });
    expect(last().headers["x-ap-context"]).toBe("adAccountId=999");
  });

  it("org-level tools send no context header", async () => {
    await app().callTool("apple_ads_get_me", {});
    expect(last().path).toBe("/v1/me");
    expect(last().headers["x-ap-context"]).toBeUndefined();
  });

  it("serialises query params, including arrays", async () => {
    await app().callTool("apple_ads_search_apps", { query: "photo", returnOwnedApps: true, storeFronts: ["US", "GB"], limit: 5, offset: 10 });
    const q = last().query;
    expect(q.get("query")).toBe("photo");
    expect(q.get("returnOwnedApps")).toBe("true");
    expect(q.getAll("storeFronts").join(",")).toBe("US,GB");
    expect(q.get("limit")).toBe("5");
    expect(q.get("offset")).toBe("10");

    await app().callTool("apple_ads_search_geos", { supplySource: "MAPS", query: "San", entity: "Locality", pageSize: 3 });
    expect(last().path).toBe("/v1/search/geo");
    expect(last().query.get("supplySource")).toBe("MAPS");
    expect(last().query.get("entity")).toBe("Locality");
    expect(last().query.get("pageSize")).toBe("3");
  });

  it("uses numeric path params (adamId)", async () => {
    await app().callTool("apple_ads_get_app_details", { adamId: "1234567" });
    expect(last().path).toBe("/v1/apps/1234567");
  });

  it("defaults the ad account id and the org id of get_ad_account / get_org", async () => {
    await app().callTool("apple_ads_get_ad_account", {});
    expect(last().path).toBe("/v1/ad-accounts/111222");
    await app({ APPLE_ADS_ORG_ID: "31337" }).callTool("apple_ads_get_org", {});
    expect(last().path).toBe("/v1/orgs/31337");
    await app().callTool("apple_ads_get_org", { orgId: 5 });
    expect(last().path).toBe("/v1/orgs/5");
  });

  it("resolves the org via GET /me when none is configured", async () => {
    mock.handler = (req) => (req.path === "/v1/me" ? { json: { result: { userId: 1, orgId: 8080 } } } : { json: { result: {} } });
    await app().callTool("apple_ads_get_org", {});
    expect(last().path).toBe("/v1/orgs/8080");
  });

  it("auto-selects the sole ad account when none is configured", async () => {
    mock.handler = (req) => (req.path === "/v1/acls" ? { json: { result: { acls: [{ adAccount: { id: 4321, orgId: 1 }, roles: ["Admin"] }] } } } : { json: { result: {} } });
    const a = app({ APPLE_ADS_AD_ACCOUNT_ID: "" });
    const r = await a.callTool("apple_ads_get_campaign", { campaignId: 1 });
    expect(r.isError).toBe(false);
    expect(last().headers["x-ap-context"]).toBe("adAccountId=4321");
  });

  it("fails with guidance when several ad accounts exist and none is chosen", async () => {
    mock.handler = () => ({ json: { result: { acls: [{ adAccount: { id: 1, orgId: 1 } }, { adAccount: { id: 2, orgId: 1 } }] } } });
    const r = await app({ APPLE_ADS_AD_ACCOUNT_ID: "" }).callTool("apple_ads_get_campaign", { campaignId: 1 });
    expect(r.isError).toBe(true);
    expect(json(r.text).message).toContain("adAccountId");
  });

  it("optional-context operations omit the header when no ad account is known", async () => {
    await app({ APPLE_ADS_AD_ACCOUNT_ID: "" }).callTool("apple_ads_get_budget_order", { sharedBudgetId: 9 });
    expect(last().path).toBe("/v1/shared-budgets/9");
    expect(last().headers["x-ap-context"]).toBeUndefined();
    await app().callTool("apple_ads_get_budget_order", { sharedBudgetId: 9 });
    expect(last().headers["x-ap-context"]).toBe("adAccountId=111222");
  });
});

describe("POST", () => {
  it("query tools take filters/sorting/pagination at the top level and post them as the body", async () => {
    const args = {
      filters: [{ field: "adGroupId", operator: "EQUALS", value: 542317095 }],
      sorting: [{ field: "name", order: "ASC" }],
      pagination: { offset: 0, pageSize: 10, fetchTotalCount: true },
    };
    await app().callTool("apple_ads_query_keywords", args);
    expect(last().method).toBe("POST");
    expect(last().path).toBe("/v1/keywords/query");
    expect(last().body).toEqual(args);
    expect(last().headers["content-type"]).toContain("application/json");
  });

  it("an empty query posts an empty body (returns everything)", async () => {
    await app().callTool("apple_ads_query_campaigns", {});
    expect(last().body).toEqual({});
  });

  it("create tools nest the payload under body and default adAccountId into it", async () => {
    const body = {
      name: "Brand",
      billingEvent: "TAPS",
      promotedObjectType: "APPSTORE_APP",
      promotedObjectId: "1234567",
      dailyBudget: { value: { amount: "50", currency: "USD" } },
      targeting: { supplySource: { include: ["APPSTORE"] } },
    };
    const r = await app().callTool("apple_ads_create_campaign", { body });
    expect(r.isError, r.text).toBe(false);
    expect(last().method).toBe("POST");
    expect(last().path).toBe("/v1/campaigns");
    expect(last().body).toMatchObject({ ...body, adAccountId: 111222 });
  });

  it("does not retry a failed create on 5xx", async () => {
    mock.queue.push({ status: 503, json: { error: { code: "internal_server_error", message: "boom" } } });
    const r = await app().callTool("apple_ads_create_campaign", {
      body: { name: "n", billingEvent: "TAPS", promotedObjectType: "APPSTORE_APP", promotedObjectId: "1", dailyBudget: { value: { amount: "1", currency: "USD" } }, targeting: {} },
    });
    expect(r.isError).toBe(true);
    expect(json(r.text).status).toBe(503);
    expect(mock.requests).toHaveLength(1);
  });

  it("bulk tools send the items envelope", async () => {
    const body = { allowPartialSuccess: true, items: [{ correlationId: 0, data: { adGroupId: 5, text: "photo editor", matchType: "EXACT" } }] };
    await app().callTool("apple_ads_bulk_create_keywords", { body });
    expect(last().path).toBe("/v1/keywords/bulk-create");
    expect(last().body).toEqual(body);
  });

  it("recommendation apply/dismiss take an items array", async () => {
    const items = [{ id: "abc", promotedObjectId: "123", promotedObjectType: "APPSTORE_APP" }];
    await app().callTool("apple_ads_dismiss_daily_budget_recommendations", { items });
    expect(last().path).toBe("/v1/recommendations/daily-budgets/dismiss");
    expect(last().body).toEqual(items);
  });

  it("uploads an asset as multipart form data", async () => {
    const file = path.join(os.tmpdir(), `asset-${process.pid}.png`);
    fs.writeFileSync(file, Buffer.from("89504e470d0a1a0a", "hex"));
    const r = await app().callTool("apple_ads_upload_asset", { filePath: file, promotedObjectId: "brand-1", promotedObjectType: "BUSINESS_BRAND" });
    expect(r.isError, r.text).toBe(false);
    expect(last().path).toBe("/v1/assets/upload");
    expect(String(last().headers["content-type"])).toMatch(/^multipart\/form-data; boundary=/);
    const raw = last().rawBody.toString("latin1");
    expect(raw).toContain('name="promotedObjectId"');
    expect(raw).toContain("brand-1");
    expect(raw).toContain("BUSINESS_BRAND");
    expect(raw).toContain(`filename="${path.basename(file)}"`);
    expect(raw).toContain("image/png");
  });

  it("accepts base64 uploads and validates the file inputs", async () => {
    const a = app();
    const ok = await a.callTool("apple_ads_upload_asset", { contentBase64: Buffer.from("hello").toString("base64"), fileName: "x.jpg", promotedObjectId: "b", promotedObjectType: "BUSINESS_BRAND" });
    expect(ok.isError, ok.text).toBe(false);
    expect(last().rawBody.toString()).toContain("image/jpeg");
    const none = await a.callTool("apple_ads_upload_asset", { promotedObjectId: "b", promotedObjectType: "BUSINESS_BRAND" });
    expect(none.isError).toBe(true);
    expect(json(none.text).message).toContain("exactly one of filePath or contentBase64");
  });
});

describe("PUT / DELETE", () => {
  it("PUT sends a partial body", async () => {
    await app().callTool("apple_ads_update_campaign", { campaignId: 77, body: { status: "PAUSED", name: "Renamed" } });
    expect(last().method).toBe("PUT");
    expect(last().path).toBe("/v1/campaigns/77");
    expect(last().body).toEqual({ status: "PAUSED", name: "Renamed" });
  });

  it("update_ad_account defaults the path id to the context account", async () => {
    await app().callTool("apple_ads_update_ad_account", { body: { name: "New name" } });
    expect(last().method).toBe("PUT");
    expect(last().path).toBe("/v1/ad-accounts/111222");
  });

  it("DELETE returns an ok marker for empty responses", async () => {
    mock.queue.push({ status: 204 });
    const r = await app().callTool("apple_ads_delete_keyword", { keywordId: 31 });
    expect(r.isError).toBe(false);
    expect(json(r.text)).toEqual({ ok: true, status: 204 });
    expect(last().method).toBe("DELETE");
    expect(last().path).toBe("/v1/keywords/31");
  });

  it("surfaces Apple's error envelope with a hint", async () => {
    mock.queue.push({ status: 404, json: { error: { code: "NOT_FOUND", message: "Campaign not found" } } });
    const r = await app().callTool("apple_ads_delete_campaign", { campaignId: 1 });
    expect(r.isError).toBe(true);
    const e = json(r.text);
    expect(e.status).toBe(404);
    expect(e.code).toBe("NOT_FOUND");
    expect(e.message).toContain("Campaign not found");
    expect(e.hint).toContain("does not exist");
  });
});

describe("validation and safety", () => {
  it("rejects unknown and invalid arguments with details", async () => {
    const a = app();
    const unknown = await a.callTool("apple_ads_get_campaign", { campaignId: 1, campaign_id: 2 });
    expect(unknown.isError).toBe(true);
    expect(JSON.stringify(json(unknown.text).details)).toContain("campaign_id");
    const bad = await a.callTool("apple_ads_search_geos", { supplySource: "MOON" });
    expect(bad.isError).toBe(true);
    expect(JSON.stringify(json(bad.text).details)).toContain("supplySource");
    expect(mock.requests).toHaveLength(0);
  });

  it("reports unknown tools and disabled tools distinctly", async () => {
    const a = createAppleAdsServer({ config: loadConfig(mockEnv(mock, key, { APPLE_ADS_READ_ONLY: "true" })).config });
    expect(json((await a.callTool("nope", {})).text).message).toContain("Unknown tool");
    const dis = await a.callTool("apple_ads_create_campaign", { body: {} });
    expect(dis.isError).toBe(true);
    expect(json(dis.text).message).toContain("APPLE_ADS_READ_ONLY");
    expect(mock.requests).toHaveLength(0);
  });

  it("missing credentials produce a helpful error naming the variables", async () => {
    const a = createAppleAdsServer({ config: loadConfig({}).config });
    const r = await a.callTool("apple_ads_get_me", {});
    expect(r.isError).toBe(true);
    const e = json(r.text);
    expect(e.code).toBe("CONFIG_ERROR");
    for (const v of ["APPLE_ADS_CLIENT_ID", "APPLE_ADS_TEAM_ID", "APPLE_ADS_KEY_ID", "APPLE_ADS_PRIVATE_KEY_PATH"]) expect(e.message).toContain(v);
  });

  it("never leaks the access token or client secret in errors", async () => {
    mock.queue.push({ status: 400, json: { error: { code: "bad", message: "Bearer tok-1 client_secret=abcdefghijklmnop" } } });
    const r = await app().callTool("apple_ads_get_campaign", { campaignId: 1 });
    expect(r.text).not.toContain("abcdefghijklmnop");
    expect(r.text).not.toMatch(/Bearer tok-1/);
  });
});

describe("apple_ads_request (escape hatch)", () => {
  it("sends arbitrary requests with context, query and body", async () => {
    const a = app();
    const r = await a.callTool("apple_ads_request", { method: "POST", path: "/v1/future/thing", query: { a: 1, tags: ["x", "y"] }, body: { hello: "world" } });
    expect(r.isError, r.text).toBe(false);
    expect(last().method).toBe("POST");
    expect(last().path).toBe("/v1/future/thing");
    expect(last().query.get("a")).toBe("1");
    expect(last().body).toEqual({ hello: "world" });
    expect(last().headers["x-ap-context"]).toBe("adAccountId=111222");
    await a.callTool("apple_ads_request", { method: "GET", path: "/me", noContext: true });
    expect(last().path).toBe("/v1/me");
    expect(last().headers["x-ap-context"]).toBeUndefined();
    await a.callTool("apple_ads_request", { method: "PUT", path: "campaigns/5", adAccountId: "adAccountId=3", body: { status: "PAUSED" } });
    expect(last().path).toBe("/v1/campaigns/5");
    expect(last().headers["x-ap-context"]).toBe("adAccountId=3");
  });

  it("refuses full URLs, query strings and traversal", async () => {
    const a = app();
    for (const p of ["https://evil.example/x", "//evil.example/x", "/campaigns?x=1", "/a/../b"]) {
      const r = await a.callTool("apple_ads_request", { method: "GET", path: p });
      expect(r.isError, p).toBe(true);
    }
    expect(mock.requests).toHaveLength(0);
  });

  it("is limited to read requests under APPLE_ADS_READ_ONLY", async () => {
    const a = app({ APPLE_ADS_READ_ONLY: "true" });
    expect((await a.callTool("apple_ads_request", { method: "GET", path: "/campaigns/1" })).isError).toBe(false);
    expect((await a.callTool("apple_ads_request", { method: "POST", path: "/campaigns/query", body: {} })).isError).toBe(false);
    const w = await a.callTool("apple_ads_request", { method: "DELETE", path: "/campaigns/1" });
    expect(w.isError).toBe(true);
    expect(json(w.text).code).toBe("READ_ONLY");
    expect((await a.callTool("apple_ads_request", { method: "POST", path: "/campaigns", body: {} })).isError).toBe(true);
  });
});

describe("meta tools", () => {
  it("apple_ads_list_operations lists and filters operations", async () => {
    const a = app({ APPLE_ADS_READ_ONLY: "true" });
    const all = json((await a.callTool("apple_ads_list_operations", {})).text);
    expect(all.totalTools).toBe(102);
    expect(all.enabledTools).toBeLessThan(102);
    const camp = json((await a.callTool("apple_ads_list_operations", { group: "campaigns" })).text);
    expect(camp.count).toBe(6);
    expect(camp.operations.find((o: any) => o.tool === "apple_ads_create_campaign").enabled).toBe(false);
    expect(camp.operations.find((o: any) => o.tool === "apple_ads_get_campaign").enabled).toBe(true);
    const search = json((await a.callTool("apple_ads_list_operations", { search: "bulk-create", includeDisabled: false })).text);
    expect(search.count).toBe(0);
  });

  it("apple_ads_server_status reports config without secrets and can verify credentials", async () => {
    const a = app();
    const s = json((await a.callTool("apple_ads_server_status", {})).text);
    expect(s.credentials.clientId).toBe(true);
    expect(JSON.stringify(s)).not.toContain("SEARCHADS.test-client");
    expect(s.defaults.adAccountId).toBe("111222");
    mock.handler = () => ({ json: { result: { userId: 1, orgId: 2 } } });
    const v = json((await a.callTool("apple_ads_server_status", { verify: true })).text);
    expect(v.verify).toEqual({ ok: true, me: { userId: 1, orgId: 2 } });
    mock.tokenStatus = 400;
    const bad = json((await app().callTool("apple_ads_server_status", { verify: true })).text);
    expect(bad.verify.ok).toBe(false);
    expect(bad.verify.error.code).toBe("AUTH_FAILED");
  });
});
