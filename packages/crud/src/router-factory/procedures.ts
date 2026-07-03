// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProcedureBuilder = any;

export type ProcedureMap = {
  list?: AnyProcedureBuilder;
  exportCsv?: AnyProcedureBuilder;
  getById?: AnyProcedureBuilder;
  create?: AnyProcedureBuilder;
  update?: AnyProcedureBuilder;
  delete?: AnyProcedureBuilder;
  bulkDelete?: AnyProcedureBuilder;
};

export type RequiredProcedureMap = Required<ProcedureMap>;

export type AnyRouterBuilder = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (procedures: Record<string, any>): any;
};

/**
 * Normalize a single procedure or a per-action map into a full RequiredProcedureMap.
 * If a map key is missing, falls back to `fallback` (typically protectedProcedure).
 * `exportCsv` falls back to `list` so a single-procedure config can export too.
 */
export function normalizeProcedures(
  p: AnyProcedureBuilder | ProcedureMap,
  fallback: AnyProcedureBuilder,
): RequiredProcedureMap {
  if (p && typeof p === "object" && ("list" in p || "create" in p)) {
    const map = p as ProcedureMap;
    return {
      list: map.list ?? fallback,
      exportCsv: map.exportCsv ?? map.list ?? fallback,
      getById: map.getById ?? fallback,
      create: map.create ?? fallback,
      update: map.update ?? fallback,
      delete: map.delete ?? fallback,
      bulkDelete: map.bulkDelete ?? fallback,
    };
  }
  return { list: p, exportCsv: p, getById: p, create: p, update: p, delete: p, bulkDelete: p };
}
