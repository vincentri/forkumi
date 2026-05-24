import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { buildUpdateZodSchema, buildZodSchema } from "./schema-builder";
import type { CRUDConfig, CRUDDeletePolicy, CRUDField, CRUDFieldSelect, SelectOption } from "./types";

/** Prisma error codes we handle explicitly */
const PRISMA_UNIQUE_VIOLATION = "P2002";
const PRISMA_NOT_FOUND = "P2025";

export function handlePrismaError(err: unknown): never {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: string }).code;
    if (code === PRISMA_UNIQUE_VIOLATION) {
      const fields = (err as { meta?: { target?: string[] } }).meta?.target?.join(", ");
      throw new TRPCError({
        code: "CONFLICT",
        message: fields ? `A record with this ${fields} already exists.` : "A record with these values already exists.",
      });
    }
    if (code === PRISMA_NOT_FOUND) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Record not found." });
    }
  }
  // Don't leak raw Prisma error messages to clients
  if (err instanceof TRPCError) throw err;
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." });
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function applySlugFields(fields: CRUDField[], data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };
  for (const field of fields) {
    if (!field.slugFrom) continue;
    const source = result[field.slugFrom];
    if (typeof source === "string" && source && !result[field.name]) {
      result[field.name] = toSlug(source);
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkUnique(db: any, model: string, fields: CRUDField[], data: Record<string, unknown>, excludeId?: string) {
  const uniqueFields = fields.filter((f) => f.unique && data[f.name] !== undefined);
  for (const field of uniqueFields) {
    const where: Record<string, unknown> = { [field.name]: data[field.name] };
    if (excludeId) where.NOT = { id: excludeId };
    const existing = await db[model].findFirst({ where });
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `A record with this ${field.label ?? field.name} already exists.`,
      });
    }
  }
}

function prismaModelKey(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyDeletePolicies(db: any, config: CRUDConfig, ids: string[]) {
  const policies = config.deletePolicy ?? [];
  if (policies.length === 0) return;

  for (const policy of policies) {
    if (policy.onDelete !== "restrict") continue;
    const referencingModel = prismaModelKey(policy.referencingModel);
    for (const id of ids) {
      const relatedCount = await db[referencingModel].count({
        where: { [policy.referencingField]: id },
      });
      if (relatedCount > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: policy.message ?? `Cannot delete this ${config.label.toLowerCase()} because it is still in use.`,
        });
      }
    }
  }

  for (const policy of policies) {
    await applyReferencingUpdate(db, config, policy, ids);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyReferencingUpdate(db: any, config: CRUDConfig, policy: CRUDDeletePolicy, ids: string[]) {
  if (policy.onDelete === "restrict" || policy.onDelete === "ignore") return;
  if (policy.onDelete === "setValue" && policy.value === undefined) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `deletePolicy for "${config.model}" requires value when onDelete is "setValue".`,
    });
  }

  const referencingModel = prismaModelKey(policy.referencingModel);
  const nextValue = policy.onDelete === "setNull" ? null : policy.value;
  for (const id of ids) {
    await db[referencingModel].updateMany({
      where: { [policy.referencingField]: id },
      data: { [policy.referencingField]: nextValue },
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveSelectOptions(db: any, ctx: any, field: CRUDFieldSelect): Promise<SelectOption[]> {
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

function isFilterableField(field: CRUDField): boolean {
  return field.filterable !== false && field.type !== "password" && field.type !== "multicheck";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProcedureBuilder = any;

type ProcedureMap = {
  list?: AnyProcedureBuilder;
  getById?: AnyProcedureBuilder;
  create?: AnyProcedureBuilder;
  update?: AnyProcedureBuilder;
  delete?: AnyProcedureBuilder;
  bulkDelete?: AnyProcedureBuilder;
};

type RequiredProcedureMap = Required<ProcedureMap>;

/**
 * Normalize a single procedure or a per-action map into a full RequiredProcedureMap.
 * If a map key is missing, falls back to `fallback` (typically protectedProcedure).
 */
function normalizeProcedures(
  p: AnyProcedureBuilder | ProcedureMap,
  fallback: AnyProcedureBuilder,
): RequiredProcedureMap {
  if (p && typeof p === "object" && ("list" in p || "create" in p)) {
    const map = p as ProcedureMap;
    return {
      list: map.list ?? fallback,
      getById: map.getById ?? fallback,
      create: map.create ?? fallback,
      update: map.update ?? fallback,
      delete: map.delete ?? fallback,
      bulkDelete: map.bulkDelete ?? fallback,
    };
  }
  return { list: p, getById: p, create: p, update: p, delete: p, bulkDelete: p };
}

type AnyRouterBuilder = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (procedures: Record<string, any>): any;
};

/**
 * Auto-register all CRUD configs from a barrel export into a single router object.
 * Uses config.model as the tRPC route key — NOT the export name.
 *
 * @example
 * // src/server/router.ts
 * import * as CRUDConfigs from "~/crud";
 * const crudRouters = buildCRUDRouters(CRUDConfigs, router, protectedProcedure, prisma);
 * export const adminRouter = router({ me: ..., ...crudRouters });
 * // → admin.post.list, admin.product.create, etc.
 */
export function buildCRUDRouters(
  configs: Record<string, CRUDConfig>,
  routerFn: AnyRouterBuilder,
  procedure: AnyProcedureBuilder | ProcedureMap | ((config: CRUDConfig) => ProcedureMap),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any,
): Record<string, ReturnType<typeof createCRUDRouter>> {
  return Object.fromEntries(
    Object.values(configs).map((config) => [
      config.model,
      config.mode === "keyValue"
        ? createKeyValueRouter(
            config,
            routerFn,
            typeof procedure === "function" ? (procedure(config).list ?? procedure) : procedure,
            prismaClient,
          )
        : createCRUDRouter(
            config,
            routerFn,
            typeof procedure === "function" ? procedure(config) : procedure,
            prismaClient,
          ),
    ]),
  );
}

export function createKeyValueRouter(
  config: CRUDConfig,
  routerFn: AnyRouterBuilder,
  procedure: AnyProcedureBuilder,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any,
) {
  const missingNamespace = config.fields.filter((f) => !f.namespace);
  if (missingNamespace.length > 0) {
    console.warn(
      `[crud] keyValue config "${config.model}": fields missing namespace: ${missingNamespace.map((f) => `"${f.name}"`).join(", ")}`,
    );
  }

  const model = prismaModelKey(config.model);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prismaClient as any;

  return routerFn({
    get: procedure.query(async () => {
      const rows = await db[model].findMany();
      return Object.fromEntries(rows.map((r: { key: string; value: string | null }) => [r.key, r.value ?? ""]));
    }),
    update: procedure
      .input(z.object({ data: z.record(z.string(), z.string()) }))
      .mutation(async ({ input }: { input: { data: Record<string, string> } }) => {
        await Promise.all(
          Object.entries(input.data).map(([key, value]) => {
            const fieldMeta = config.fields.find((f) => f.name === key);
            return db[model].upsert({
              where: { key },
              update: { namespace: fieldMeta?.namespace ?? null, value },
              create: { key, namespace: fieldMeta?.namespace ?? null, value },
            });
          }),
        );
        return { ok: true };
      }),
  });
}

/**
 * Create a tRPC router for a CRUD resource.
 *
 * @param config          The CRUD config from defineCRUD()
 * @param routerFn        Your app's `router` function (from your trpc.ts)
 * @param procedure       A protected procedure builder OR a per-action ProcedureMap
 * @param prismaClient    Your Prisma client instance (or transaction client)
 *
 * @example
 * // src/server/router.ts
 * import { createCRUDRouter } from "@repo/crud";
 * import { prisma } from "@repo/db";
 * import { router, protectedProcedure } from "./trpc";
 * import { ProductCRUD } from "~/crud/product";
 *
 * export const appRouter = router({
 *   product: createCRUDRouter(ProductCRUD, router, protectedProcedure, prisma),
 * });
 */
export function createCRUDRouter(
  config: CRUDConfig,
  routerFn: AnyRouterBuilder,
  procedure: AnyProcedureBuilder | ProcedureMap,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any,
) {
  const model = prismaModelKey(config.model);
  const createSchema = buildZodSchema(config);
  const updateSchema = buildUpdateZodSchema(config);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prismaClient as any;

  // Determine fallback: if procedure is a map, use list as fallback; otherwise use procedure itself
  const fallback = procedure && typeof procedure === "object" && "list" in procedure
    ? (procedure as ProcedureMap).list
    : procedure;
  const procs = normalizeProcedures(procedure, fallback);

  const readOnlyRouter = {
    list: procs.list
      .input(
        z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(config.pageSize ?? 20),
          search: z.string().optional(),
          sortField: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).optional(),
          filters: z.record(z.union([z.string(), z.boolean(), z.null()])).optional(),
        }),
      )
      .query(async ({ input, ctx }: { input: { page: number; pageSize: number; search?: string; sortField?: string; sortDir?: "asc" | "desc"; filters?: Record<string, string | boolean | null> }; ctx?: unknown }) => {
        const { page, pageSize, sortField, sortDir, filters } = input;
        const skip = (page - 1) * pageSize;

        const andClauses: Record<string, unknown>[] = [];

        if (filters) {
          for (const [fieldName, value] of Object.entries(filters)) {
            if (value === null || value === undefined) continue;
            const field = config.fields.find((f) => f.name === fieldName);
            if (!field || !isFilterableField(field)) continue;
            if (field.type === "boolean") {
              andClauses.push({ [fieldName]: value });
            } else if (field.type === "select") {
              andClauses.push({ [fieldName]: value });
            } else if (field.type === "date") {
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

        const where = andClauses.length > 0 ? { AND: andClauses } : {};

        const validFieldNames = config.fields.map((f) => f.name);
        const defaultField = config.defaultSortField ?? "createdAt";
        const defaultDir = config.defaultSortDir ?? "desc";
        const orderBy =
          sortField && validFieldNames.includes(sortField)
            ? { [sortField]: sortDir ?? "asc" }
            : { [defaultField]: defaultDir };

        if (config.query?.list) {
          const result = await config.query.list({
            db,
            ctx,
            input,
            baseWhere: where,
            orderBy,
            skip,
            take: pageSize,
          });
          return {
            ...result,
            totalPages: result.totalPages ?? Math.ceil(result.total / result.pageSize),
          };
        }

        const [items, total] = await Promise.all([
          db[model].findMany({ where, skip, take: pageSize, orderBy }),
          db[model].count({ where }),
        ]);

        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
      }),

    options: procs.list.query(async ({ ctx }: { ctx?: unknown }) => {
      const selectFields = config.fields.filter((field): field is CRUDFieldSelect => field.type === "select");
      const entries = await Promise.all(
        selectFields.map(async (field) => [field.name, await resolveSelectOptions(db, ctx, field)] as const),
      );
      return Object.fromEntries(entries) as Record<string, SelectOption[]>;
    }),

    getById: procs.getById
      .input(z.object({ id: z.string() }))
      .query(async ({ input }: { input: { id: string } }) => {
        const item = await db[model].findUnique({ where: { id: input.id } });
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        return item;
      }),
  };

  // readOnly: only expose list + getById
  if (config.readOnly) {
    return routerFn(readOnlyRouter);
  }

  return routerFn({
    ...readOnlyRouter,

    create: procs.create
      .input(createSchema)
      .mutation(async ({ input }: { input: Record<string, unknown> }) => {
        if (config.maxRecords !== undefined) {
          const count = await db[model].count();
          if (count >= config.maxRecords) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Maximum of ${config.maxRecords} ${config.label.toLowerCase()} allowed.`,
            });
          }
        }
        const createData = applySlugFields(config.fields, input);
        await checkUnique(db, model, config.fields, createData);
        try {
          return await db[model].create({ data: createData });
        } catch (err) {
          handlePrismaError(err);
        }
      }),

    update: procs.update
      .input(z.object({ id: z.string(), data: updateSchema }))
      .mutation(async ({ input }: { input: { id: string; data: Record<string, unknown> } }) => {
        const updateData = applySlugFields(config.fields, input.data);
        await checkUnique(db, model, config.fields, updateData, input.id);
        try {
          return await db[model].update({ where: { id: input.id }, data: updateData });
        } catch (err) {
          handlePrismaError(err);
        }
      }),

    delete: procs.delete
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }: { input: { id: string } }) => {
        try {
          await applyDeletePolicies(db, config, [input.id]);
          return await db[model].delete({ where: { id: input.id } });
        } catch (err) {
          handlePrismaError(err);
        }
      }),

    bulkDelete: procs.bulkDelete
      .input(z.object({ ids: z.array(z.string()).min(1) }))
      .mutation(async ({ input }: { input: { ids: string[] } }) => {
        try {
          await applyDeletePolicies(db, config, input.ids);
          return await db[model].deleteMany({ where: { id: { in: input.ids } } });
        } catch (err) {
          handlePrismaError(err);
        }
      }),
  });
}
