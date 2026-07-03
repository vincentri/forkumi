/**
 * Generates valid, invalid, and duplicate test data from CRUD field definitions.
 * Used by the generic CRUD test suite so each resource gets type-appropriate data.
 */

import type { CRUDField } from "@repo/crud";

const ts = () => Date.now();

// ── Valid data ────────────────────────────────────────

/**
 * Returns a data record with a valid value for every fillable field.
 * Fields that require external data (model-select, image, file) are skipped.
 */
export function generateValidData(
  fields: CRUDField[],
): Record<string, string | boolean> {
  const data: Record<string, string | boolean> = {};

  for (const field of fields) {
    if (field.showInForm === false) continue;

    switch (field.type) {
      case "text":
        if (field.slugFrom) continue; // auto-derived, skip
        data[field.name] = `Test ${field.label} ${ts()}`;
        break;
      case "textarea":
        data[field.name] = `Test ${field.label} content`;
        break;
      case "email":
        data[field.name] = `test-${ts()}@example.com`;
        break;
      case "url":
        data[field.name] = `https://example.com/test-${ts()}`;
        break;
      case "richtext":
        data[field.name] = `Test ${field.label} body text`;
        break;
      case "password":
        data[field.name] = "test-password-123";
        break;
      case "number":
        data[field.name] = "42";
        break;
      case "date":
        data[field.name] = "2026-06-15";
        break;
      case "datetime":
        data[field.name] = "2026-06-15T10:00";
        break;
      case "boolean":
        data[field.name] = field.default === true ? false : true;
        break;
      case "select":
        if (field.options && field.options.length > 0) {
          data[field.name] = field.options[0].label;
        }
        break;
      case "color":
        data[field.name] = "#ff0000";
        break;
      case "range":
        data[field.name] = "50";
        break;
      // model-select, model-multi-select, multicheck, image, file — skip
      default:
        break;
    }
  }

  return data;
}

// ── Identifier field ──────────────────────────────────

/**
 * Picks a short, unique string suitable for row-visibility assertions.
 * Prefers the first text/email field that isn't a slug derivation.
 */
export function pickIdentifier(
  fields: CRUDField[],
  prefix: string,
): { field: CRUDField; value: string } {
  const field = fields.find(
    (f) =>
      ["text", "email"].includes(f.type) &&
      !f.slugFrom &&
      f.showInForm !== false,
  );
  if (!field) throw new Error("No text/email field found for identifier");
  return { field, value: `${prefix} ${ts()}` };
}
