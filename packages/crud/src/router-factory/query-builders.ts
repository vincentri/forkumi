import type { CRUDConfig, CRUDFieldSelect } from "../types";
import { isFilterableField } from "../util/filter";

const DEFAULT_SORT_FIELD = "createdAt";
const DEFAULT_SORT_DIR: "asc" | "desc" = "desc";
const DEFAULT_SORT_DIR_FALLBACK: "asc" | "desc" = "asc";

/**
 * Translate CRUDResourceClient `filters` into a Prisma `where` clause.
 * Returns `{}` if no filters are set.
 */
export function buildWhere(
  config: CRUDConfig,
  filters?: Record<string, string | boolean | null>,
): Record<string, unknown> {
  const andClauses: Record<string, unknown>[] = [];

  if (filters) {
    for (const [fieldName, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;
      const field = config.fields.find((f) => f.name === fieldName);
      if (!field || !isFilterableField(field)) continue;
      if (field.type === "boolean") {
        andClauses.push({ [fieldName]: value });
      } else if (field.type === "select") {
        const sel = field as CRUDFieldSelect;
        if (sel.multiple && sel.relation) {
          if (sel.relation.through) {
            const joinAccessor = sel.relation.through + "s";
            const joinThatField = sel.relation.model + "Id";
            andClauses.push({ [joinAccessor]: { some: { [joinThatField]: value } } });
          } else {
            andClauses.push({ [sel.relation.field]: { some: { id: value } } });
          }
        } else {
          andClauses.push({ [fieldName]: value });
        }
      } else if (field.type === "date" || field.type === "datetime") {
        const [from, to] = String(value).split("|");
        const clause: Record<string, unknown> = {};
        if (from) clause.gte = new Date(from);
        if (to) { const d = new Date(to); d.setHours(23, 59, 59, 999); clause.lte = d; }
        if (Object.keys(clause).length) andClauses.push({ [fieldName]: clause });
      } else if (field.type === "number" || field.type === "range") {
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) andClauses.push({ [fieldName]: numberValue });
      } else {
        andClauses.push({ [fieldName]: { contains: String(value), mode: "insensitive" } });
      }
    }
  }

  return andClauses.length > 0 ? { AND: andClauses } : {};
}

export function buildOrderBy(
  config: CRUDConfig,
  sortField?: string,
  sortDir?: "asc" | "desc",
): Record<string, "asc" | "desc"> {
  const validFieldNames = config.fields.map((f) => f.name);
  const defaultField = config.defaultSortField ?? DEFAULT_SORT_FIELD;
  const defaultDir = config.defaultSortDir ?? DEFAULT_SORT_DIR;
  return sortField && validFieldNames.includes(sortField)
    ? { [sortField]: sortDir ?? DEFAULT_SORT_DIR_FALLBACK }
    : { [defaultField]: defaultDir };
}
