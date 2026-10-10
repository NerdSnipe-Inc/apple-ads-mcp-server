import fs from "node:fs";
import path from "node:path";
import { File } from "node:buffer";
import { z } from "zod";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { AppleAdsClient } from "./client.js";
import { expandHome } from "./config.js";
import { AppleAdsToolError } from "./errors.js";
import type { OperationKind, ToolContext, ToolDef } from "./types.js";

// ───────────────────────── shared parameter schemas ─────────────────────────

/** An entity ID. Accepts a string or a number (numbers are coerced to strings). */
export function idParam(description: string) {
  return z.preprocess((v) => (typeof v === "number" ? String(v) : v), z.string().min(1)).describe(description);
}

/** A numeric ID (e.g. adamId). Accepts a number or a numeric string. */
export function numParam(description: string) {
  return z
    .preprocess((v) => (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : v), z.number().int())
    .describe(description);
}

const adAccountIdSchema = (required: boolean) =>
  z
    .preprocess((v) => (typeof v === "number" ? String(v) : v), z.string().min(1))
    .optional()
    .describe(
      "Ad account ID, sent as the X-AP-Context header (adAccountId=<id>). " +
        (required
          ? "Defaults to APPLE_ADS_AD_ACCOUNT_ID; if that is unset and the API user can access exactly one ad account, that account is used. Use apple_ads_get_user_acls to list accounts."
          : "Optional for this operation; defaults to APPLE_ADS_AD_ACCOUNT_ID when set.")
    );

// ───────────────────────── operation specs (emitted by the generator) ─────────────────────────

export type ArgSpec =
  | { role: "context"; sdk: string }
  | { role: "path"; sdk: string; name: string; type: "string" | "number"; default?: "adAccountId" | "orgId" }
  | { role: "query"; sdk: string; name: string }
  | { role: "body"; sdk: string; mode: "flatten"; keys: string[] }
  | { role: "body"; sdk: string; mode: "nested"; name: string }
  | { role: "file"; sdk: string }
  | { role: "form"; sdk: string; name: string };

export interface OperationSpec {
  name: string;
  group: string;
  operationId: string;
  kind: OperationKind;
  method: string;
  path: string;
  scope: "adAccount" | "optional" | "none";
  annotations: ToolAnnotations & { readOnlyHint: boolean };
  description: string;
  args: ArgSpec[];
  shape: Record<string, z.ZodTypeAny>;
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

async function buildFile(args: Record<string, unknown>): Promise<File> {
  const filePath = args.filePath as string | undefined;
  const b64 = args.contentBase64 as string | undefined;
  if (Boolean(filePath) === Boolean(b64)) {
    throw new AppleAdsToolError("Provide exactly one of filePath or contentBase64.", { code: "INVALID_INPUT" });
  }
  let bytes: Buffer;
  let name = args.fileName as string | undefined;
  if (filePath) {
    const abs = expandHome(filePath);
    try {
      bytes = await fs.promises.readFile(abs);
    } catch (e) {
      throw new AppleAdsToolError(`Cannot read filePath ${abs}: ${(e as Error).message}`, { code: "INVALID_INPUT" });
    }
    name ??= path.basename(abs);
  } else {
    bytes = Buffer.from(b64 as string, "base64");
    if (!name) throw new AppleAdsToolError("fileName is required with contentBase64.", { code: "INVALID_INPUT" });
  }
  if (bytes.length === 0) throw new AppleAdsToolError("The image is empty.", { code: "INVALID_INPUT" });
  const type = (args.contentType as string | undefined) ?? MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream";
  return new File([new Uint8Array(bytes)], name, { type });
}

/** Make a body object's required adAccountId optional (it defaults to the ad account in context). */
function relaxBody(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodObject && "adAccountId" in schema.shape) {
    return schema.extend({
      adAccountId: z.number().optional().describe("Ad account ID. Defaults to the adAccountId in context."),
    });
  }
  return schema;
}

function stringify(status: number, data: unknown): string {
  if (data === undefined || data === null || data === "") return JSON.stringify({ ok: true, status }, null, 2);
  return typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

export function defineOperation(spec: OperationSpec): ToolDef {
  const shape: Record<string, z.ZodTypeAny> = {};
  if (spec.scope !== "none") shape.adAccountId = adAccountIdSchema(spec.scope === "adAccount");
  for (const [k, v] of Object.entries(spec.shape)) shape[k] = spec.args.some((a) => a.role === "body" && a.mode === "nested" && a.name === k) ? relaxBody(v) : v;
  const inputSchema = z.object(shape).strict();
  const idempotent = spec.kind === "read" || spec.kind === "update" || spec.kind === "delete";

  return {
    name: spec.name,
    group: spec.group,
    description: spec.description,
    inputSchema,
    annotations: spec.annotations,
    meta: { operationId: spec.operationId, method: spec.method, path: spec.path, kind: spec.kind },
    handler: async (args: Record<string, unknown>, ctx: ToolContext) => {
      const client = ctx.client;
      const context = spec.scope === "none" ? undefined : await client.resolveContext(args.adAccountId as string | undefined, spec.scope === "adAccount");
      const sdkArgs: unknown[] = [];
      for (const a of spec.args) {
        switch (a.role) {
          case "context":
            sdkArgs.push(context);
            break;
          case "path": {
            let v = args[a.name] as string | number | undefined;
            if (v === undefined && a.default === "adAccountId") v = AppleAdsClient.adAccountIdFromContext(context);
            if (v === undefined && a.default === "orgId") v = await client.resolveOrgId(undefined);
            if (v === undefined) throw new AppleAdsToolError(`Missing required argument ${a.name}`, { code: "INVALID_INPUT" });
            sdkArgs.push(a.type === "number" ? Number(v) : String(v));
            break;
          }
          case "query":
          case "form":
            sdkArgs.push(args[a.name]);
            break;
          case "file":
            sdkArgs.push(await buildFile(args));
            break;
          case "body":
            if (a.mode === "flatten") {
              const obj: Record<string, unknown> = {};
              for (const k of a.keys) if (args[k] !== undefined) obj[k] = args[k];
              sdkArgs.push(obj);
            } else {
              let v = args[a.name];
              if (v && typeof v === "object" && !Array.isArray(v)) {
                const o = v as Record<string, unknown>;
                const shapeNode = spec.shape[a.name];
                if (shapeNode instanceof z.ZodObject && "adAccountId" in shapeNode.shape && o.adAccountId === undefined) {
                  const id = AppleAdsClient.adAccountIdFromContext(context);
                  if (id !== undefined && Number.isFinite(Number(id))) v = { ...o, adAccountId: Number(id) };
                }
              }
              sdkArgs.push(v);
            }
            break;
        }
      }
      const res = await client.invoke(spec.operationId, sdkArgs, { idempotent });
      return stringify(res.status, res.data);
    },
  };
}
