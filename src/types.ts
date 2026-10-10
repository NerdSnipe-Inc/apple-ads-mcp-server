import type { z } from "zod";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import type { AppleAdsClient } from "./client.js";
import type { ServerConfig } from "./config.js";

export type OperationKind = "read" | "create" | "update" | "delete" | "action";

/** Runtime services handed to every tool handler. */
export interface ToolContext {
  client: AppleAdsClient;
  config: ServerConfig;
  /** Snapshot of the registry (used by the meta tools). */
  registry: () => RegistrySnapshot;
}

export interface RegistrySnapshot {
  all: ToolDef[];
  enabled: ToolDef[];
  disabled: Array<{ name: string; reason: string }>;
}

export interface ToolMeta {
  /** SDK operation id, or undefined for hand-written meta tools. */
  operationId?: string;
  method: string;
  path: string;
  kind: OperationKind | "meta";
}

export interface ToolDef {
  name: string;
  group: string;
  description: string;
  /** Always a z.object(...) (validated at registration). */
  inputSchema: z.ZodTypeAny;
  annotations: ToolAnnotations & { readOnlyHint: boolean };
  meta: ToolMeta;
  /** Stays available under APPLE_ADS_READ_ONLY (the handler enforces read-only itself). */
  readOnlySafe?: boolean;
  /** Returns the text payload of the MCP result. Throw to signal an error. */
  handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
}
