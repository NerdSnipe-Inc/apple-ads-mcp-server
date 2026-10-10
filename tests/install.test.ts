import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const merge = resolve(__dirname, "../scripts/merge_claude_desktop_config.py");
const installer = resolve(__dirname, "../scripts/install-global.sh");

function run(config: string, extra: string[] = []) {
  return spawnSync(
    "python3",
    [merge, "--config", config, "--name", "apple-ads", "--command", "/abs/node", "--arg", "/abs/dist/index.js",
     "--env", "APPLE_ADS_CLIENT_ID=cid", "--env", "APPLE_ADS_ORG_ID=", ...extra],
    { encoding: "utf8" },
  );
}

describe("merge_claude_desktop_config.py", () => {
  it("creates a config (and parent dir) when missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "aa-merge-"));
    const cfg = join(dir, "nested", "claude_desktop_config.json");
    const r = run(cfg);
    expect(r.status).toBe(0);
    const j = JSON.parse(readFileSync(cfg, "utf8"));
    expect(j.mcpServers["apple-ads"]).toEqual({ command: "/abs/node", args: ["/abs/dist/index.js"], env: { APPLE_ADS_CLIENT_ID: "cid" } });
  });

  it("preserves other keys and servers, writes a .bak, and is idempotent", () => {
    const dir = mkdtempSync(join(tmpdir(), "aa-merge-"));
    const cfg = join(dir, "c.json");
    const original = { theme: "dark", mcpServers: { other: { command: "x", args: [] } } };
    writeFileSync(cfg, JSON.stringify(original));
    expect(run(cfg).status).toBe(0);
    expect(JSON.parse(readFileSync(cfg + ".bak", "utf8"))).toEqual(original);
    const j = JSON.parse(readFileSync(cfg, "utf8"));
    expect(j.theme).toBe("dark");
    expect(j.mcpServers.other).toEqual(original.mcpServers.other);
    expect(Object.keys(j.mcpServers).sort()).toEqual(["apple-ads", "other"]);
    expect(run(cfg).status).toBe(0);
    expect(Object.keys(JSON.parse(readFileSync(cfg, "utf8")).mcpServers).sort()).toEqual(["apple-ads", "other"]);
    expect(readdirSync(dir).filter((f) => f.startsWith("c.json.bak")).length).toBe(2);
  });

  it("refuses invalid JSON and leaves the file untouched", () => {
    const dir = mkdtempSync(join(tmpdir(), "aa-merge-"));
    const cfg = join(dir, "c.json");
    writeFileSync(cfg, "{ not json");
    const r = run(cfg);
    expect(r.status).toBe(2);
    expect(readFileSync(cfg, "utf8")).toBe("{ not json");
    expect(existsSync(cfg + ".bak")).toBe(false);
  });

  it("dry-run prints without writing", () => {
    const dir = mkdtempSync(join(tmpdir(), "aa-merge-"));
    const cfg = join(dir, "c.json");
    const r = run(cfg, ["--dry-run"]);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout).mcpServers["apple-ads"].command).toBe("/abs/node");
    expect(existsSync(cfg)).toBe(false);
  });
});

describe("install-global.sh", () => {
  it("passes bash -n and is executable", () => {
    expect(spawnSync("bash", ["-n", installer]).status).toBe(0);
    expect(readFileSync(installer, "utf8").startsWith("#!/usr/bin/env bash")).toBe(true);
  });
});
