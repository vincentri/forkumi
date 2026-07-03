import type { CRUDConfig, CRUDField, CRUDFieldSelect } from "./types";

function sanitizeField(field: CRUDField): CRUDField {
  if (field.type !== "select") return field;
  const { optionsQuery, ...clientField } = field as CRUDFieldSelect;
  if (optionsQuery) {
    return { ...clientField, hasDynamicOptions: true } as CRUDField;
  }
  return clientField as CRUDField;
}

/**
 * Remove server-only functions before a CRUD config is passed to client components.
 */
export function toClientCRUDConfig(config: CRUDConfig): CRUDConfig {
  // Strip server-only function-bearing keys (query, beforeCreate, beforeUpdate).
  // Functions can't be serialized to Client Components — a single non-stripped hook
  // 500s the whole admin nav/page.
  const serverOnlyKeys = new Set(["query", "beforeCreate", "beforeUpdate"]);
  const clientConfig = Object.fromEntries(
    Object.entries(config).filter(([k, v]) => !serverOnlyKeys.has(k) && typeof v !== "function"),
  ) as unknown as CRUDConfig;
  return {
    ...clientConfig,
    fields: config.fields.map(sanitizeField),
  };
}
