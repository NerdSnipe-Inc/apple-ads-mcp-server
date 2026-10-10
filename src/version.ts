import fs from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

function readJson(url: URL): { version?: string } {
  try {
    return JSON.parse(fs.readFileSync(url, "utf8"));
  } catch {
    return {};
  }
}

/** package.json sits one level above both src/ and dist/. */
export const SERVER_VERSION: string = readJson(new URL("../package.json", import.meta.url)).version ?? "0.0.0";

function sdkVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const entry = require.resolve("@apple/apple-ads-platform");
    // .../node_modules/@apple/apple-ads-platform/dist/index.js -> ../package.json
    return readJson(new URL("../package.json", pathToFileURL(entry))).version ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const SDK_VERSION: string = sdkVersion();
