import fs from "node:fs";
import path from "node:path";
import { AppleAdsApi } from "@apple/apple-ads-platform";
import { describe, expect, it } from "vitest";
// @ts-expect-error - plain ESM script without type declarations
import { generateAll } from "../scripts/generate.mjs";
import { GROUP_NAMES, loadConfig } from "../src/config.js";
import { allTools, buildRegistry, TOOL_NAME_RE } from "../src/registry.js";

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs", "coverage.json"), "utf8"));

/** Every public operation of the pinned SDK, discovered at runtime. */
const sdkOperations = Object.getOwnPropertyNames(AppleAdsApi.prototype).filter((n) => n !== "constructor" && typeof (AppleAdsApi.prototype as any)[n] === "function");

describe("SDK coverage", () => {
  const tools = allTools();
  const opTools = tools.filter((t) => t.meta.operationId);

  it("discovers a plausible number of SDK operations", () => {
    expect(sdkOperations.length).toBeGreaterThanOrEqual(99);
  });

  it("maps every SDK operation to exactly one MCP tool", () => {
    const byOp = new Map<string, string[]>();
    for (const t of opTools) byOp.set(t.meta.operationId as string, [...(byOp.get(t.meta.operationId as string) ?? []), t.name]);
    const unmapped = sdkOperations.filter((op) => !byOp.has(op));
    const duplicated = [...byOp.entries()].filter(([, names]) => names.length !== 1);
    const unknown = [...byOp.keys()].filter((op) => !sdkOperations.includes(op));
    expect(unmapped, `SDK operations without a tool: ${unmapped.join(", ")}`).toEqual([]);
    expect(duplicated).toEqual([]);
    expect(unknown, `tools bound to operations that are not in the SDK: ${unknown.join(", ")}`).toEqual([]);
    expect(opTools).toHaveLength(sdkOperations.length);
  });

  it("matches docs/coverage.json (the machine-checkable manifest)", () => {
    expect(manifest.totals.sdkOperations).toBe(sdkOperations.length);
    expect(manifest.operations.map((o: any) => o.operationId).sort()).toEqual([...sdkOperations].sort());
    for (const o of manifest.operations) {
      const t = opTools.find((x) => x.meta.operationId === o.operationId);
      expect(t?.name, o.operationId).toBe(o.tool);
      expect(t?.group).toBe(o.group);
      expect(t?.meta.method).toBe(o.method);
      expect(t?.meta.path).toBe(o.path);
    }
    expect(manifest.totals.tools).toBe(tools.length);
  });

  it("has unique tool names matching ^[a-z0-9_]{1,64}$ and the apple_ads_ prefix", () => {
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) {
      expect(n).toMatch(TOOL_NAME_RE);
      expect(n.startsWith("apple_ads_")).toBe(true);
    }
  });

  it("includes the escape hatch and meta tools", () => {
    const names = tools.map((t) => t.name);
    expect(names).toContain("apple_ads_request");
    expect(names).toContain("apple_ads_list_operations");
    expect(names).toContain("apple_ads_server_status");
  });

  it("reports per-group counts that add up", () => {
    const counts: Record<string, number> = {};
    for (const t of tools) counts[t.group] = (counts[t.group] ?? 0) + 1;
    expect(Object.keys(counts).sort()).toEqual([...GROUP_NAMES].sort());
    for (const [g, n] of Object.entries(manifest.groups)) expect(counts[g], g).toBe(n);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(tools.length);
  });

  it("sets MCP annotations consistently with the HTTP method / kind", () => {
    for (const t of opTools) {
      const { method } = t.meta;
      const a = t.annotations;
      if (method === "GET") expect(a.readOnlyHint, t.name).toBe(true);
      if (method === "DELETE") {
        expect(a.readOnlyHint, t.name).toBe(false);
        expect(a.destructiveHint, t.name).toBe(true);
      }
      if (t.meta.kind === "read") {
        expect(a.readOnlyHint, t.name).toBe(true);
        expect(a.destructiveHint, t.name).toBe(false);
        expect(a.idempotentHint, t.name).toBe(true);
      }
      if (t.meta.kind === "create") {
        expect(a.readOnlyHint, t.name).toBe(false);
        expect(a.destructiveHint, t.name).toBe(false);
        expect(a.idempotentHint, t.name).toBe(false);
      }
      if (t.meta.kind === "update") {
        expect(a.readOnlyHint, t.name).toBe(false);
        expect(a.idempotentHint, t.name).toBe(true);
      }
      expect(a.title, t.name).toBeTruthy();
    }
  });

  it("produces a valid JSON schema for every tool", () => {
    const reg = buildRegistry(loadConfig({}).config);
    for (const t of reg.enabled) {
      const js = reg.jsonSchema(t) as any;
      expect(js.type, t.name).toBe("object");
      expect(JSON.stringify(js).length).toBeGreaterThan(10);
      expect(t.description.length, t.name).toBeGreaterThan(20);
    }
  });

  it("every ad-account scoped tool accepts an optional adAccountId", () => {
    const reg = buildRegistry(loadConfig({}).config);
    for (const t of opTools.filter((x) => x.description.includes("Ad-account scoped"))) {
      const js = reg.jsonSchema(t) as any;
      expect(js.properties.adAccountId, t.name).toBeDefined();
      expect(js.required ?? [], t.name).not.toContain("adAccountId");
    }
  });

  it("generated files are in sync with the SDK + scripts/curated.mjs (drift detection)", () => {
    const { files } = generateAll();
    for (const [rel, content] of files as Map<string, string>) {
      const abs = path.join(root, rel);
      expect(fs.existsSync(abs), `${rel} missing - run npm run generate`).toBe(true);
      expect(fs.readFileSync(abs, "utf8") === content, `${rel} is stale - run npm run generate`).toBe(true);
    }
  });
});
