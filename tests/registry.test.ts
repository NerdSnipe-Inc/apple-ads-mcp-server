import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { allTools, buildRegistry } from "../src/registry.js";

const names = (env: Record<string, string>) => buildRegistry(loadConfig(env).config).enabled.map((t) => t.name);

describe("tool filtering", () => {
  const total = allTools().length;

  it("exposes everything by default (read/write)", () => {
    const n = names({});
    expect(n).toHaveLength(total);
    expect(n).toContain("apple_ads_create_campaign");
    expect(n).toContain("apple_ads_delete_campaign");
  });

  it("APPLE_ADS_READ_ONLY hides every tool that can modify data", () => {
    const reg = buildRegistry(loadConfig({ APPLE_ADS_READ_ONLY: "true" }).config);
    expect(reg.enabled.length).toBeGreaterThan(40);
    for (const t of reg.enabled) expect(t.annotations.readOnlyHint || t.readOnlySafe, t.name).toBeTruthy();
    const n = reg.enabled.map((t) => t.name);
    expect(n).toContain("apple_ads_query_campaigns");
    expect(n).toContain("apple_ads_get_campaign");
    expect(n).toContain("apple_ads_report_apps_campaigns");
    expect(n).not.toContain("apple_ads_create_campaign");
    expect(n).not.toContain("apple_ads_update_campaign");
    expect(n).not.toContain("apple_ads_delete_campaign");
    expect(n).not.toContain("apple_ads_apply_daily_budget_recommendations");
    expect(n).not.toContain("apple_ads_bulk_create_keywords");
    expect(n).toContain("apple_ads_request"); // kept, but enforces read-only itself
    expect(reg.disabled.find((d) => d.name === "apple_ads_create_campaign")?.reason).toContain("READ_ONLY");
  });

  it("APPLE_ADS_ENABLED_GROUPS keeps only the listed groups (plus meta)", () => {
    const reg = buildRegistry(loadConfig({ APPLE_ADS_ENABLED_GROUPS: "campaigns,keywords" }).config);
    const groups = new Set(reg.enabled.map((t) => t.group));
    expect([...groups].sort()).toEqual(["campaigns", "keywords", "meta"]);
  });

  it("APPLE_ADS_DISABLED_GROUPS removes groups (including meta)", () => {
    const n = names({ APPLE_ADS_DISABLED_GROUPS: "bulk,meta" });
    expect(n).not.toContain("apple_ads_bulk_create_keywords");
    expect(n).not.toContain("apple_ads_request");
    expect(n).toContain("apple_ads_create_keyword");
    expect(n.length).toBe(total - 4 - 3);
  });

  it("combines switches", () => {
    const n = names({ APPLE_ADS_READ_ONLY: "true", APPLE_ADS_ENABLED_GROUPS: "campaigns" });
    expect(n.filter((x) => !x.startsWith("apple_ads_request") && !x.includes("list_operations") && !x.includes("server_status")).sort()).toEqual([
      "apple_ads_get_campaign",
      "apple_ads_get_campaign_legacy_limited_status_details",
      "apple_ads_query_campaigns",
    ]);
  });

  it("rejects duplicate tool names", () => {
    const t = allTools()[0];
    expect(() => buildRegistry(loadConfig({}).config, [t, t])).toThrow(/Duplicate/);
  });
});
