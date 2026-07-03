import type { CRUDConfig, CRUDFieldSelect } from "../types";
import { resolveSelectOptions } from "./select-options";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date
    ? value.toISOString()
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildCsv(db: any, ctx: unknown, config: CRUDConfig, rows: Record<string, unknown>[]): Promise<string> {
  const exportFields = config.fields.filter((field) => field.showInTable !== false && field.type !== "password");
  const selectOptionMaps = Object.fromEntries(
    await Promise.all(
      exportFields
        .filter((field): field is CRUDFieldSelect => field.type === "select")
        .map(async (field) => {
          const options = await resolveSelectOptions(db, ctx, field);
          return [field.name, new Map(options.map((option) => [option.value, option.label]))] as const;
        }),
    ),
  ) as Record<string, Map<string, string>>;

  const header = exportFields.map((field) => csvEscape(field.label));
  const body = rows.map((row) =>
    exportFields.map((field) => {
      const value = row[field.name];
      if (field.type === "select") {
        const raw = value == null ? "" : String(value);
        return csvEscape(selectOptionMaps[field.name]?.get(raw) ?? raw);
      }
      if ((field.type === "date" || field.type === "datetime") && value) {
        return csvEscape(new Date(value as string | Date).toISOString());
      }
      return csvEscape(value);
    }).join(","),
  );

  return [header.join(","), ...body].join("\n");
}
