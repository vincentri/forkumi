import type { CRUDField } from "../types";

export function isFilterableField(field: CRUDField): boolean {
  return field.filterable !== false && field.type !== "password" && field.type !== "multicheck" && field.type !== "separator";
}
