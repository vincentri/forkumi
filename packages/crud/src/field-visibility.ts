import type { CRUDField } from "./types";

export function isFieldVisible(field: CRUDField, values: Record<string, unknown>): boolean {
  const condition = field.visibleWhen;
  if (!condition) return true;

  const value = values[condition.field];

  if ("equals" in condition) {
    return value === condition.equals;
  }

  if ("notEquals" in condition) {
    return value !== condition.notEquals;
  }

  if (condition.in) {
    return condition.in.includes(value);
  }

  if (condition.truthy !== undefined) {
    return condition.truthy ? Boolean(value) : !value;
  }

  return true;
}

export function visibleFieldsForValues(fields: CRUDField[], values: Record<string, unknown>): CRUDField[] {
  return fields.filter((field) => isFieldVisible(field, values));
}
