import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { allTools } from "../src/registry.js";
import { createAppleAdsServer } from "../src/server.js";
import { makeKey, mockEnv, startMockApple, type MockApple, type TestKey } from "./helpers.js";
import { sample } from "./sample.js";

let key: TestKey;
let mock: MockApple;
let pngPath: string;

beforeAll(async () => {
  key = makeKey();
  mock = await startMockApple(key);
  pngPath = path.join(os.tmpdir(), `apple-ads-test-${process.pid}.png`);
  fs.writeFileSync(pngPath, Buffer.from("89504e470d0a1a0a", "hex"));
});
afterAll(async () => mock.close());
beforeEach(() => mock.reset());

function app(extra: Record<string, string> = {}) {
  return createAppleAdsServer({
    config: loadConfig(mockEnv(mock, key, { APPLE_ADS_ORG_ID: "424242", ...extra })).config,
    clientDeps: { sleep: async () => {}, stderr: () => {} },
  });
}

const opTools = allTools().filter((t) => t.meta.operationId);

describe("every SDK operation executes end-to-end through its tool", () => {
  for (const tool of opTools) {
    it(`${tool.name} -> ${tool.meta.method} ${tool.meta.path}`, async () => {
      const server = app();
      const args = sample(tool.inputSchema) as Record<string, unknown>;
      if (tool.meta.operationId === "uploadAsset") args.filePath = pngPath;
      const res = await server.callTool(tool.name, args);
      expect(res.isError, res.text).toBe(false);

      // find the API request (token requests are recorded separately)
      const req = mock.requests.at(-1)!;
      // /orgs/{id} and ad-account defaults may add one /me or ACL call before; the target is the last request
      expect(req.method).toBe(tool.meta.method);
      const re = new RegExp("^" + tool.meta.path.replace(/\{[^}]+\}/g, "[^/]+") + "$");
      expect(req.path, `path template ${tool.meta.path}`).toMatch(re);
      expect(req.headers.authorization).toMatch(/^Bearer tok-\d+$/);

      const scoped = tool.description.includes("Ad-account scoped");
      if (scoped) expect(req.headers["x-ap-context"]).toBe("adAccountId=111222");
      if (tool.description.includes("Org-level operation")) expect(req.headers["x-ap-context"]).toBeUndefined();

      if (["POST", "PUT"].includes(tool.meta.method) && tool.meta.operationId !== "uploadAsset") {
        // a JSON body was sent whenever the tool takes one
        const takesBody = Object.keys((tool.inputSchema as z.ZodObject<any>).shape).some((k) => k !== "adAccountId");
        if (takesBody) expect(req.body, "request body").toBeDefined();
      }
    });
  }
});
