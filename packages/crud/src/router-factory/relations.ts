import type { CRUDConfig, CRUDField, CRUDFieldSelect } from "../types";

/**
 * Prisma model delegate accessor for a model name.
 * Assumes the first letter is lowercased (e.g. "BlogPost" → "blogPost"),
 * matching Prisma's default client convention.
 */
export function prismaModelKey(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

function relationSelectFields(config: CRUDConfig): CRUDFieldSelect[] {
  return config.fields.filter(
    (f): f is CRUDFieldSelect => f.type === "select" && !!(f as CRUDFieldSelect).multiple && !!(f as CRUDFieldSelect).relation,
  );
}

function scheduleFields(config: CRUDConfig): CRUDField[] {
  return config.fields.filter((f) => f.type === "schedule");
}

function galleryFields(config: CRUDConfig): CRUDField[] {
  return config.fields.filter((f) => f.type === "gallery");
}

/**
 * Build a Prisma `include` clause that fetches the join rows for every multi-select
 * relation field and every schedule/gallery field. Returns undefined if there are none.
 */
export function buildRelationInclude(config: CRUDConfig): Record<string, unknown> | undefined {
  const relFields = relationSelectFields(config);
  const schedFields = scheduleFields(config);
  const galleryFlds = galleryFields(config);
  if (relFields.length === 0 && schedFields.length === 0 && galleryFlds.length === 0) return undefined;
  return {
    ...Object.fromEntries(
      relFields.map((f) => {
        if (f.relation!.through) {
          const joinAccessor = f.relation!.through + "s";
          const joinThatField = f.relation!.model + "Id";
          return [joinAccessor, { select: { [joinThatField]: true } }];
        }
        return [f.relation!.field, { select: { id: true } }];
      }),
    ),
    ...Object.fromEntries(schedFields.map((f) => [f.name, { orderBy: { dayOfWeek: "asc" as const } }])),
    ...Object.fromEntries(galleryFlds.map((f) => [f.name, { orderBy: { position: "asc" as const } }])),
  };
}

/**
 * Convert a Prisma row's relation `include` data into the ID arrays the frontend
 * expects. E.g. `{ tags: [{ id: "1" }, { id: "2" }] }` → `{ tagIds: ["1","2"] }`.
 */
export function flattenRelations(config: CRUDConfig, row: Record<string, unknown>): Record<string, unknown> {
  const relFields = relationSelectFields(config);
  if (relFields.length === 0) return row;
  const result = { ...row };
  for (const field of relFields) {
    if (field.relation!.through) {
      const joinAccessor = field.relation!.through + "s";
      const joinThatField = field.relation!.model + "Id";
      const relValue = result[joinAccessor];
      if (Array.isArray(relValue)) {
        result[field.name] = relValue.map((r: Record<string, unknown>) => String(r[joinThatField] ?? "")).filter(Boolean);
      }
      delete result[joinAccessor];
    } else {
      const relKey = field.relation!.field;
      const relValue = result[relKey];
      if (Array.isArray(relValue)) {
        result[field.name] = relValue.map((r: Record<string, unknown>) => String(r.id ?? "")).filter(Boolean);
      }
      delete result[relKey];
    }
  }
  return result;
}

/**
 * Convert a frontend payload's relation ID arrays into Prisma's nested-write format
 * (e.g. `{ tagIds: ["1","2"] }` → `{ tags: { connect: [{ id: "1" }, { id: "2" }] } }`
 * or with `deleteMany: {}` for updates).
 */
export function applyRelationWrites(
  fields: CRUDField[],
  data: Record<string, unknown>,
  isUpdate = false,
): Record<string, unknown> {
  const result = { ...data };
  for (const field of fields) {
    if (field.type !== "select") continue;
    const sel = field as CRUDFieldSelect;
    if (!sel.multiple || !sel.relation) continue;
    const ids = result[sel.name];
    delete result[sel.name];
    const idArray = Array.isArray(ids) ? ids.filter((v): v is string => typeof v === "string" && v !== "") : [];
    if (sel.relation.through) {
      const joinAccessor = sel.relation.through + "s";
      const joinThatField = sel.relation.model + "Id";
      result[joinAccessor] = isUpdate
        ? { deleteMany: {}, create: idArray.map((id) => ({ [joinThatField]: id })) }
        : { create: idArray.map((id) => ({ [joinThatField]: id })) };
    } else {
      result[sel.relation.field] = { set: idArray.map((id) => ({ id })) };
    }
  }
  return result;
}

function normalizeScheduleItem(item: Record<string, unknown>): Record<string, unknown> {
  return {
    dayOfWeek: item.dayOfWeek,
    openTime: item.openTime && String(item.openTime).length > 0 ? String(item.openTime) : null,
    closeTime: item.closeTime && String(item.closeTime).length > 0 ? String(item.closeTime) : null,
  };
}

/**
 * Convert schedule field arrays into Prisma nested writes.
 */
export function applyScheduleWrites(
  fields: CRUDField[],
  data: Record<string, unknown>,
  isUpdate = false,
): Record<string, unknown> {
  const result = { ...data };
  for (const field of fields) {
    if (field.type !== "schedule") continue;
    const items = result[field.name];
    delete result[field.name];
    if (!Array.isArray(items)) continue;
    const create = items.map((item) => normalizeScheduleItem(item as Record<string, unknown>));
    result[field.name] = isUpdate ? { deleteMany: {}, create } : { create };
  }
  return result;
}

function normalizeGalleryItem(item: Record<string, unknown>): Record<string, unknown> {
  return {
    url: String(item.url ?? ""),
    alt: item.alt && String(item.alt).length > 0 ? String(item.alt) : null,
    position: typeof item.position === "number" ? item.position : 0,
  };
}

/**
 * Convert gallery field arrays into Prisma nested writes.
 * Replaces the entire set on update (deleteMany + create) so positions stay 0..n-1.
 */
export function applyGalleryWrites(
  fields: CRUDField[],
  data: Record<string, unknown>,
  isUpdate = false,
): Record<string, unknown> {
  const result = { ...data };
  for (const field of fields) {
    if (field.type !== "gallery") continue;
    const items = result[field.name];
    delete result[field.name];
    if (!Array.isArray(items)) continue;
    const create = items.map((item, index) => ({
      ...normalizeGalleryItem(item as Record<string, unknown>),
      position: index,
    }));
    result[field.name] = isUpdate ? { deleteMany: {}, create } : { create };
  }
  return result;
}
