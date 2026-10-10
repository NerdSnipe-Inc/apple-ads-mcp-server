import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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

async function connect(env: Record<string, string>) {
  const app = createAppleAdsServer({ config: loadConfig(env).config, clientDeps: { stderr: () => {} } });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0.0.0" });
  await Promise.all([app.server.connect(a), client.connect(b)]);
  return { client, app };
}

describe("MCP protocol surface (in-memory)", () => {
  it("lists all tools with schemas and annotations", async () => {
    const { client } = await connect(mockEnv(mock, key));
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(102);
    const get = tools.find((t) => t.name === "apple_ads_get_campaign")!;
    expect(get.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, idempotentHint: true });
    expect(get.inputSchema.required).toContain("campaignId");
    const del = tools.find((t) => t.name === "apple_ads_delete_campaign")!;
    expect(del.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    const create = tools.find((t) => t.name === "apple_ads_create_campaign")!;
    expect(create.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: false, idempotentHint: false });
    expect(create.inputSchema.required).toContain("body");
  });

  it("starts and lists tools without credentials", async () => {
    const { client } = await connect({});
    expect((await client.listTools()).tools).toHaveLength(102);
    const res = await client.callTool({ name: "apple_ads_get_me", arguments: {} });
    expect(res.isError).toBe(true);
    expect((res.content as Array<{ text: string }>)[0].text).toContain("APPLE_ADS_CLIENT_ID");
  });

  it("calls a tool over the protocol", async () => {
    mock.reset();
    mock.handler = () => ({ json: { result: { userId: 1, orgId: 2 } } });
    const { client } = await connect(mockEnv(mock, key));
    const res = await client.callTool({ name: "apple_ads_get_me", arguments: {} });
    expect(res.isError).toBeFalsy();
    expect(JSON.parse((res.content as Array<{ text: string }>)[0].text)).toEqual({ result: { userId: 1, orgId: 2 } });
  });

  it("hides write tools in read-only mode", async () => {
    const { client } = await connect(mockEnv(mock, key, { APPLE_ADS_READ_ONLY: "true" }));
    const { tools } = await client.listTools();
    expect(tools.length).toBeLessThan(102);
    for (const t of tools) expect(t.annotations?.readOnlyHint || t.name === "apple_ads_request").toBeTruthy();
    const res = await client.callTool({ name: "apple_ads_delete_campaign", arguments: { campaignId: 1 } });
    expect(res.isError).toBe(true);
  });
});
