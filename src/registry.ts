import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GENERATED_TOOLS } from "./tools/index.js";
import { metaTools } from "./tools/meta.js";
import type { ServerConfig } from "./config.js";
import type { RegistrySnapshot, ToolDef } from "./types.js";

export const TOOL_NAME_RE = /^[a-z0-9_]{1,64}$/;

export function allTools(): ToolDef[] {
  return [...GENERATED_TOOLS, ...metaTools];
}

/** Why a tool is not exposed under this config (undefined = enabled). */
export function disabledReason(tool: ToolDef, config: ServerConfig): string | undefined {
  if (config.disabledGroups.includes(tool.group)) return `group "${tool.group}" is in APPLE_ADS_DISABLED_GROUPS`;
  // The meta group is exempt from the allow-list (but not the deny-list): discovery tools stay available.
  if (config.enabledGroups && tool.group !== "meta" && !config.enabledGroups.includes(tool.group)) {
    return `group "${tool.group}" is not in APPLE_ADS_ENABLED_GROUPS`;
  }
  if (config.readOnly && !tool.annotations.readOnlyHint && !tool.readOnlySafe) return "APPLE_ADS_READ_ONLY is enabled and this tool can modify data";
  return undefined;
}

export interface Registry extends RegistrySnapshot {
  byName: Map<string, ToolDef>;
  jsonSchema(tool: ToolDef): Record<string, unknown>;
}

export function buildRegistry(config: ServerConfig, tools: ToolDef[] = allTools()): Registry {
  const seen = new Set<string>();
  for (const t of tools) {
    if (!TOOL_NAME_RE.test(t.name)) throw new Error(`Invalid tool name: ${t.name}`);
    if (seen.has(t.name)) throw new Error(`Duplicate tool name: ${t.name}`);
    seen.add(t.name);
    if (!(t.inputSchema instanceof z.ZodObject)) throw new Error(`Tool ${t.name} inputSchema must be a z.object`);
  }
  const enabled: ToolDef[] = [];
  const disabled: Array<{ name: string; reason: string }> = [];
  for (const t of tools) {
    const reason = disabledReason(t, config);
    if (reason) disabled.push({ name: t.name, reason });
    else enabled.push(t);
  }
  const cache = new Map<string, Record<string, unknown>>();
  return {
    all: tools,
    enabled,
    disabled,
    byName: new Map(enabled.map((t) => [t.name, t])),
    jsonSchema(tool) {
      let s = cache.get(tool.name);
      if (!s) {
        const js = zodToJsonSchema(tool.inputSchema, { target: "jsonSchema7", $refStrategy: "none" }) as Record<string, unknown>;
        delete js.$schema;
        s = js;
        cache.set(tool.name, s);
      }
      return s;
    },
  };
}
