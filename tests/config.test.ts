import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { expandHome, GROUP_NAMES, loadConfig, normalizePem } from "../src/config.js";

describe("loadConfig", () => {
  it("reports every missing credential variable with its alias", () => {
    const { missing, config } = loadConfig({});
    expect(missing).toHaveLength(4);
    expect(missing.join(" ")).toContain("APPLE_ADS_CLIENT_ID");
    expect(missing.join(" ")).toContain("ASA_TEAM_ID");
    expect(missing.join(" ")).toContain("APPLE_ADS_KEY_ID");
    expect(missing.join(" ")).toContain("APPLE_ADS_PRIVATE_KEY_PATH or APPLE_ADS_PRIVATE_KEY");
    expect(config.readOnly).toBe(false);
  });

  it("reads APPLE_ADS_* variables", () => {
    const { config, missing } = loadConfig({
      APPLE_ADS_CLIENT_ID: "c",
      APPLE_ADS_TEAM_ID: "t",
      APPLE_ADS_KEY_ID: "k",
      APPLE_ADS_PRIVATE_KEY_PATH: "/tmp/key.pem",
      APPLE_ADS_ORG_ID: "42",
      APPLE_ADS_AD_ACCOUNT_ID: "99",
    });
    expect(missing).toEqual([]);
    expect(config).toMatchObject({ clientId: "c", teamId: "t", keyId: "k", privateKeyPath: "/tmp/key.pem", orgId: "42", adAccountId: "99" });
  });

  it("accepts ASA_* aliases", () => {
    const { config, missing } = loadConfig({
      ASA_CLIENT_ID: "c2",
      ASA_TEAM_ID: "t2",
      ASA_KEY_ID: "k2",
      ASA_PRIVATE_KEY_PATH: "/tmp/k2.pem",
      ASA_ORG_ID: "7",
      ASA_AD_ACCOUNT_ID: "8",
    });
    expect(missing).toEqual([]);
    expect(config).toMatchObject({ clientId: "c2", teamId: "t2", keyId: "k2", privateKeyPath: "/tmp/k2.pem", orgId: "7", adAccountId: "8" });
  });

  it("prefers APPLE_ADS_* over ASA_* when both are set", () => {
    const { config } = loadConfig({ APPLE_ADS_CLIENT_ID: "primary", ASA_CLIENT_ID: "alias" });
    expect(config.clientId).toBe("primary");
  });

  it("ignores blank values", () => {
    const { config } = loadConfig({ APPLE_ADS_CLIENT_ID: "  ", ASA_CLIENT_ID: "fallback" });
    expect(config.clientId).toBe("fallback");
  });

  it("expands ~ in key paths", () => {
    expect(expandHome("~/keys/a.pem")).toBe(path.join(os.homedir(), "keys", "a.pem"));
    expect(expandHome("~")).toBe(os.homedir());
    expect(expandHome("/abs/a.pem")).toBe("/abs/a.pem");
    expect(loadConfig({ APPLE_ADS_PRIVATE_KEY_PATH: "~/k.pem" }).config.privateKeyPath).toBe(path.join(os.homedir(), "k.pem"));
  });

  it("accepts an inline PEM and normalises literal \\n", () => {
    const { config, missing } = loadConfig({
      APPLE_ADS_CLIENT_ID: "c",
      APPLE_ADS_TEAM_ID: "t",
      APPLE_ADS_KEY_ID: "k",
      APPLE_ADS_PRIVATE_KEY: "-----BEGIN EC PRIVATE KEY-----\\nABC\\n-----END EC PRIVATE KEY-----",
    });
    expect(missing).toEqual([]);
    expect(config.privateKey).toBe("-----BEGIN EC PRIVATE KEY-----\nABC\n-----END EC PRIVATE KEY-----\n");
    expect(normalizePem("x\n")).toBe("x\n");
  });

  it("parses safety switches", () => {
    expect(loadConfig({ APPLE_ADS_READ_ONLY: "true" }).config.readOnly).toBe(true);
    expect(loadConfig({ APPLE_ADS_READ_ONLY: "1" }).config.readOnly).toBe(true);
    expect(loadConfig({ APPLE_ADS_READ_ONLY: "false" }).config.readOnly).toBe(false);
    const { config, problems } = loadConfig({ APPLE_ADS_ENABLED_GROUPS: "Campaigns, ad-groups", APPLE_ADS_DISABLED_GROUPS: "bulk,nope" });
    expect(config.enabledGroups).toEqual(["campaigns", "ad_groups"]);
    expect(config.disabledGroups).toEqual(["bulk", "nope"]);
    expect(problems.join(" ")).toContain('unknown group "nope"');
  });

  it("falls back on invalid numbers and log levels with a problem report", () => {
    const { config, problems } = loadConfig({ APPLE_ADS_TIMEOUT_MS: "abc", APPLE_ADS_LOG_LEVEL: "loud" });
    expect(config.timeoutMs).toBe(30_000);
    expect(config.logLevel).toBe("warn");
    expect(problems).toHaveLength(2);
  });

  it("knows all group names including meta", () => {
    expect(GROUP_NAMES).toContain("meta");
    expect(new Set(GROUP_NAMES).size).toBe(GROUP_NAMES.length);
  });
});
