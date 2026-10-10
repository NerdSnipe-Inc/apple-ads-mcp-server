import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { AppleAdsClient, type ClientDeps } from "./client.js";
import { formatError } from "./errors.js";
import { buildRegistry, disabledReason, type Registry } from "./registry.js";
import type { ServerConfig } from "./config.js";
import type { ToolContext, ToolDef } from "./types.js";
import { SERVER_VERSION } from "./version.js";

export interface CreateServerOptions {
  config: ServerConfig;
  client?: AppleAdsClient;
  clientDeps?: ClientDeps;
  tools?: ToolDef[];
}

export interface AppleAdsServer {
  server: Server;
  registry: Registry;
  client: AppleAdsClient;
  /** Run a tool exactly like a tools/call request would (used by tests). */
  callTool(name: string, args: unknown): Promise<{ text: string; isError: boolean }>;
}

function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], ...(isError ? { isError: true } : {}) };
}

function formatZod(e: z.ZodError): unknown {
  return e.issues.map((i) => ({ path: i.path.join(".") || "(root)", message: i.message, code: i.code }));
}

export function createAppleAdsServer(opts: CreateServerOptions): AppleAdsServer {
  const { config } = opts;
  const registry = buildRegistry(config, opts.tools);
  const client = opts.client ?? new AppleAdsClient(config, opts.clientDeps);
  const ctx: ToolContext = { client, config, registry: () => registry };

  const server = new Server({ name: "apple-ads-mcp-server", version: SERVER_VERSION }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: registry.enabled.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: registry.jsonSchema(tool) as { type: "object" },
      annotations: tool.annotations,
    })),
  }));

  async function callTool(name: string, rawArgs: unknown): Promise<{ text: string; isError: boolean }> {
    const tool = registry.byName.get(name);
    if (!tool) {
      const known = registry.all.find((t) => t.name === name);
      const why = known ? disabledReason(known, config) : undefined;
      return {
        isError: true,
        text: JSON.stringify(
          { error: true, message: known ? `Tool ${name} is disabled: ${why}` : `Unknown tool: ${name}`, hint: known ? undefined : "Call apple_ads_list_operations to see available tools." },
          null,
          2
        ),
      };
    }
    const parsed = tool.inputSchema.safeParse(rawArgs ?? {});
    if (!parsed.success) {
      return { isError: true, text: JSON.stringify({ error: true, message: `Invalid arguments for ${name}`, details: formatZod(parsed.error) }, null, 2) };
    }
    try {
      return { isError: false, text: await tool.handler(parsed.data as Record<string, unknown>, ctx) };
    } catch (e) {
      return { isError: true, text: formatError(e, client.secrets()) };
    }
  }

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const r = await callTool(request.params.name, request.params.arguments);
    return textResult(r.text, r.isError);
  });

  return { server, registry, client, callTool };
}
