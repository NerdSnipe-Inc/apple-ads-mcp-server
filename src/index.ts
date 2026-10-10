#!/usr/bin/env node
/**
 * Apple Ads MCP Server
 *
 * Exposes every operation of the Apple Ads Platform API (v1) - through Apple's official
 * Node SDK (@apple/apple-ads-platform) - as Model Context Protocol tools.
 *
 * GitHub : https://github.com/NerdSnipe-Inc/apple-ads-mcp-server
 * Docs   : https://developer.apple.com/documentation/apple-ads-platform-api
 *
 * Required env vars (set in .env or your MCP client config):
 *   APPLE_ADS_CLIENT_ID, APPLE_ADS_TEAM_ID, APPLE_ADS_KEY_ID,
 *   APPLE_ADS_PRIVATE_KEY_PATH (or APPLE_ADS_PRIVATE_KEY)
 * Optional: APPLE_ADS_AD_ACCOUNT_ID, APPLE_ADS_ORG_ID, APPLE_ADS_READ_ONLY,
 *           APPLE_ADS_ENABLED_GROUPS, APPLE_ADS_DISABLED_GROUPS (see README).
 */

import "dotenv/config";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createAppleAdsServer } from "./server.js";
import { SDK_VERSION, SERVER_VERSION } from "./version.js";

const HELP = `apple-ads-mcp-server ${SERVER_VERSION}
MCP server (stdio) for the Apple Ads Platform API v1.

Usage: apple-ads-mcp-server [--version | --help | --list-tools]

Environment: see https://github.com/NerdSnipe-Inc/apple-ads-mcp-server#configuration
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${SERVER_VERSION} (sdk ${SDK_VERSION})\n`);
    return;
  }
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    return;
  }

  const { config, missing, problems } = loadConfig();
  const app = createAppleAdsServer({ config });

  if (argv.includes("--list-tools")) {
    for (const t of app.registry.enabled) process.stdout.write(`${t.name}\n`);
    return;
  }

  // NOTE: stdout is the MCP protocol channel - everything human-readable goes to stderr.
  for (const p of problems) console.error(`Apple Ads MCP Server: config warning: ${p}`);
  if (missing.length) {
    console.error(
      `Apple Ads MCP Server: credentials not configured (missing: ${missing.join("; ")}). ` +
        "Tools will list but API calls will return a configuration error until they are set."
    );
  }

  const transport = new StdioServerTransport();
  await app.server.connect(transport);
  console.error(
    `Apple Ads MCP Server v${SERVER_VERSION} running - ${app.registry.enabled.length}/${app.registry.all.length} tools enabled` +
      (config.readOnly ? " (read-only)" : "")
  );

  const shutdown = async () => {
    try {
      await app.server.close();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error starting Apple Ads MCP Server:", err instanceof Error ? err.message : err);
  process.exit(1);
});
