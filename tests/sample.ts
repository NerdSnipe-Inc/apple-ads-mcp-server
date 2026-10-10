import { z } from "zod";

/** Build a minimal valid value for a zod schema (required properties only). */
export function sample(schema: z.ZodTypeAny, name = "x"): unknown {
  if (schema instanceof z.ZodOptional) return undefined;
  if (schema instanceof z.ZodNullable) return sample(schema.unwrap(), name);
  if (schema instanceof z.ZodDefault) return sample(schema._def.innerType, name);
  if (schema instanceof z.ZodEffects) return sample(schema._def.schema, name);
  if (schema instanceof z.ZodObject) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema.shape as Record<string, z.ZodTypeAny>)) {
      if (v instanceof z.ZodOptional) continue;
      out[k] = sample(v, k);
    }
    return out;
  }
  if (schema instanceof z.ZodArray) return [sample(schema.element, name)];
  if (schema instanceof z.ZodEnum) return schema.options[0];
  if (schema instanceof z.ZodLiteral) return schema.value;
  if (schema instanceof z.ZodUnion) return sample(schema.options[0], name);
  if (schema instanceof z.ZodRecord) return {};
  if (schema instanceof z.ZodNumber) return 7;
  if (schema instanceof z.ZodBoolean) return true;
  if (schema instanceof z.ZodString) return `${name}-v`;
  return "any-value";
}
