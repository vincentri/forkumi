import type { CRUDFieldSelect, SelectOption } from "../types";
import { prismaModelKey } from "./relations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveSelectOptions(db: any, ctx: any, field: CRUDFieldSelect): Promise<SelectOption[]> {
  if (field.optionsQuery) {
    return field.optionsQuery({ db, ctx });
  }

  if (field.optionsFrom) {
    const source = field.optionsFrom;
    const sourceModel = prismaModelKey(source.model);
    const rows = await db[sourceModel].findMany({
      where: source.where,
      orderBy: source.orderBy,
      select: {
        [source.valueField]: true,
        [source.labelField]: true,
      },
    });

    return rows.map((row: Record<string, unknown>) => ({
      value: String(row[source.valueField] ?? ""),
      label: String(row[source.labelField] ?? row[source.valueField] ?? ""),
    }));
  }

  return field.options ?? [];
}

/**
 * Variant of `resolveSelectOptions` used by the search dropdown on autocomplete fields.
 * Runs three queries in parallel: the currently-selected row (always present), the
 * rows for any specific IDs (e.g. resolving labels for rows in the current list),
 * and a search-limited page. Merges them deduped.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveSelectOptionsForSearch(
  db: any,
  ctx: any,
  field: CRUDFieldSelect,
  search?: string,
  selected?: string,
  ids?: string[],
): Promise<SelectOption[]> {
  if (field.optionsQuery) {
    return field.optionsQuery({ db, ctx, search, selected });
  }

  if (field.optionsFrom) {
    const source = field.optionsFrom;
    const sourceModel = prismaModelKey(source.model);
    const limit = source.limit ?? 50;
    const searchFields = source.searchFields?.length ? source.searchFields : [source.labelField];
    const baseWhere = source.where ?? {};

    const searchWhere = search
      ? { OR: searchFields.map((f) => ({ [f]: { contains: search, mode: "insensitive" } })) }
      : undefined;
    const idsWhere = ids && ids.length > 0
      ? { [source.valueField]: { in: ids } }
      : undefined;

    const [selectedRows, idsRows, searchRows] = await Promise.all([
      selected
        ? db[sourceModel].findMany({
            where: { ...baseWhere, [source.valueField]: selected },
            select: { [source.valueField]: true, [source.labelField]: true },
          })
        : Promise.resolve([]),
      idsWhere
        ? db[sourceModel].findMany({
            where: { ...baseWhere, ...idsWhere },
            orderBy: source.orderBy,
            take: Math.max(ids?.length ?? 0, limit),
            select: { [source.valueField]: true, [source.labelField]: true },
          })
        : Promise.resolve([]),
      search
        ? db[sourceModel].findMany({
            where: searchWhere ? { AND: [baseWhere, searchWhere] } : baseWhere,
            orderBy: source.orderBy,
            take: limit,
            select: { [source.valueField]: true, [source.labelField]: true },
          })
        : db[sourceModel].findMany({
            where: baseWhere,
            orderBy: source.orderBy,
            take: 10,
            select: { [source.valueField]: true, [source.labelField]: true },
          }),
    ]);

    const seen = new Set<string>();
    const options: SelectOption[] = [];
    for (const row of [...selectedRows, ...idsRows, ...searchRows]) {
      const value = String(row[source.valueField] ?? "");
      if (seen.has(value)) continue;
      seen.add(value);
      options.push({
        value,
        label: String(row[source.labelField] ?? row[source.valueField] ?? ""),
      });
    }
    return options;
  }

  const opts = field.options ?? [];
  if (!search) return opts;
  const term = search.toLowerCase();
  return opts.filter((o) => o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term));
}
