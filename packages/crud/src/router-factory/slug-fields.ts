import type { CRUDField } from "../types";
import { toSlug } from "../util/slug";

/**
 * If a field has `slugFrom`, auto-fill its value from the source field by slugifying.
 * Skipped when the target already has a value.
 */
export function applySlugFields(fields: CRUDField[], data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  for (const field of fields) {
    if (!field.slugFrom) continue;
    const source = result[field.slugFrom];
    if (typeof source === "string" && source && !result[field.name]) {
      result[field.name] = toSlug(source);
    }
  }
  return result;
}
