import { z } from "zod";
import type { CRUDConfig, CRUDField } from "./types";

const assetUrlSchema = z.string().refine(
  (value) => {
    if (value.startsWith("/")) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  },
  "Must be an absolute URL or root-relative path",
);

function fieldToZod(field: CRUDField): z.ZodTypeAny {
  // multicheck early-return: value is always string[], never goes through optional transform
  if (field.type === "multicheck") {
    return z.array(z.string()).default([]);
  }

  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "number":
      schema = z.coerce.number();
      break;
    case "boolean":
      schema = z.boolean();
      break;
    case "date":
      schema = z.coerce.date();
      break;
    case "email":
      schema = z.string().email("Must be a valid email address");
      break;
    case "url":
      schema = z.string().url();
      break;
    case "select":
      if (field.multiple) {
        schema = z.array(z.string()).default([]);
        return schema; // array fields don't go through the optional/required transform below
      }
      if (field.options && field.options.length > 0) {
        const values = field.options.map((o) => o.value) as [string, ...string[]];
        schema = z.enum(values);
      } else {
        schema = z.string();
      }
      break;
    case "color":
      schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g. #ff0000)");
      break;
    case "password":
      schema = z.string().min(1);
      break;
    case "image":
    case "file":
      schema = assetUrlSchema;
      break;
    case "range": {
      let rangeSchema = z.coerce.number();
      if (field.min !== undefined) rangeSchema = rangeSchema.min(field.min);
      if (field.max !== undefined) rangeSchema = rangeSchema.max(field.max);
      schema = rangeSchema;
      break;
    }
    case "text":
    case "textarea":
    case "richtext":
    default:
      // min(1) only applies when required — optional path handles empty string separately
      schema = field.required ? z.string().min(1, "Required") : z.string();
      break;
  }

  if (!field.required) {
    if (field.type === "boolean") {
      return schema.optional();
    }
    // Allow empty string → undefined for non-required string fields
    if (["text", "textarea", "richtext", "email", "url", "select", "password", "color", "image", "file"].includes(field.type)) {
      return z
        .union([z.literal(""), z.null(), schema])
        .optional()
        .transform((v) => (v === "" || v === null ? undefined : v));
    }
    return schema.optional();
  }

  return schema;
}

/**
 * Derive a Zod schema from a CRUD config.
 * Used for both form validation (react-hook-form) and tRPC input validation.
 */
export function buildZodSchema(config: CRUDConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of config.fields) {
    if (field.showInForm === false) continue;
    shape[field.name] = fieldToZod(field);
  }

  return z.object(shape).passthrough();
}

/** Schema for update — all fields optional (partial update) */
export function buildUpdateZodSchema(config: CRUDConfig) {
  return buildZodSchema(config).partial();
}
