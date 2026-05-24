import type { CRUDConfig } from "./types";

/**
 * Define a CRUD resource config.
 * This is the single source of truth — it drives both the tRPC router
 * and the React UI components (form, table, page).
 *
 * @example
 * export const ProductCRUD = defineCRUD({
 *   model: "product",
 *   label: "Products",
 *   fields: [
 *     { name: "title", type: "text", label: "Title", required: true },
 *     { name: "price", type: "number", label: "Price", required: true },
 *     { name: "published", type: "boolean", label: "Published", default: false },
 *   ],
 * });
 */
export function defineCRUD(config: CRUDConfig): CRUDConfig {
  // Apply defaults to fields
  const fields = config.fields.map((field) => ({
    showInTable: field.type === "password" ? false : true,
    showInForm: true,
    sortable: true,
    required: false,
    min: field.type === "range" ? 0 : undefined,
    max: field.type === "range" ? 100 : undefined,
    step: field.type === "range" ? 1 : undefined,
    ...field,
  }));

  return { ...config, fields };
}
