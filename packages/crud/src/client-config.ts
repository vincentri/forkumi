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
  const { query: _query, ...clientConfig } = config;
  return {
    ...clientConfig,
    fields: config.fields.map(sanitizeField),
  };
}
