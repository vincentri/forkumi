import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { CRUDConfig, CRUDRouterOptions, CRUDField, CRUDFieldSelect, PrismaLikeClient } from "../types";
import { buildUpdateZodSchema, buildZodSchema } from "../schema-builder";
import { applyDeletePolicies } from "./delete-policy";
import { applyGalleryWrites, applyRelationWrites, applyScheduleWrites, buildRelationInclude, flattenRelations, prismaModelKey } from "./relations";
import { buildOrderBy, buildWhere } from "./query-builders";
import { buildCsv } from "./csv";
import { resolveSelectOptions, resolveSelectOptionsForSearch } from "./select-options";
import { applySlugFields } from "./slug-fields";
import { assetFields, cleanupReplacedAssets, galleryAssetFields } from "./assets";
import { handlePrismaError } from "./errors";
import { normalizeProcedures, type AnyProcedureBuilder, type AnyRouterBuilder, type ProcedureMap } from "./procedures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkUnique(db: any, model: string, fields: CRUDField[], data: Record<string, unknown>, excludeId?: string): Promise<void> {
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
  prismaClient: PrismaLikeClient,
  options?: CRUDRouterOptions,
) {
  const model = prismaModelKey(config.model);
  const createSchema = buildZodSchema(config);
  const updateSchema = buildUpdateZodSchema(config);

  const db = prismaClient as PrismaLikeClient;

  // Determine fallback: if procedure is a map, use list as fallback; otherwise use procedure itself
  const fallback = procedure && typeof procedure === "object" && "list" in procedure
    ? (procedure as ProcedureMap).list
    : procedure;
  const procs = normalizeProcedures(procedure, fallback);
  const relInclude = buildRelationInclude(config);

  const readOnlyRouter = {
    list: procs.list
      .input(
        z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(config.pageSize ?? 20),
          search: z.string().optional(),
          sortField: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).optional(),
          filters: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])).optional(),
        }),
      )
      .query(async ({ input, ctx }: { input: { page: number; pageSize: number; search?: string; sortField?: string; sortDir?: "asc" | "desc"; filters?: Record<string, string | boolean | null> }; ctx?: unknown }) => {
        const { page, pageSize, sortField, sortDir, filters } = input;
        const skip = (page - 1) * pageSize;

        const where = buildWhere(config, filters);
        const orderBy = buildOrderBy(config, sortField, sortDir);

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

        const [rawItems, total] = await Promise.all([
          db[model].findMany({ where, skip, take: pageSize, orderBy, ...(relInclude ? { include: relInclude } : {}) }),
          db[model].count({ where }),
        ]);
        const items = rawItems.map((row: Record<string, unknown>) => flattenRelations(config, row));

        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
      }),

    exportCsv: procs.exportCsv
      .input(
        z.object({
          sortField: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).optional(),
          filters: z.record(z.string(), z.union([z.string(), z.boolean(), z.null()])).optional(),
        }),
      )
      .mutation(async ({ input, ctx }: { input: { sortField?: string; sortDir?: "asc" | "desc"; filters?: Record<string, string | boolean | null> }; ctx?: unknown }) => {
        const where = buildWhere(config, input.filters);
        const orderBy = buildOrderBy(config, input.sortField, input.sortDir);
        const rows = config.query?.list
          ? (await config.query.list({
              db,
              ctx,
              input: { page: 1, pageSize: Number.MAX_SAFE_INTEGER, sortField: input.sortField, sortDir: input.sortDir, filters: input.filters },
              baseWhere: where,
              orderBy,
              skip: 0,
              take: Number.MAX_SAFE_INTEGER,
            })).items
          : (await db[model].findMany({ where, orderBy, ...(relInclude ? { include: relInclude } : {}) })).map((row: Record<string, unknown>) => flattenRelations(config, row));
        const csv = await buildCsv(db, ctx, config, rows);
        const timestamp = new Date().toISOString().slice(0, 10);
        return {
          filename: `${config.model}-${timestamp}.csv`,
          csv,
        };
      }),

    options: procs.list.query(async ({ ctx }: { ctx?: unknown }) => {
      const selectFields = config.fields.filter(
        (field): field is CRUDFieldSelect => field.type === "select" && !!field.optionsQuery,
      );
      const entries = await Promise.all(
        selectFields.map(async (field) => [field.name, await resolveSelectOptions(db, ctx, field)] as const),
      );
      return Object.fromEntries(entries) as Record<string, import("../types").SelectOption[]>;
    }),

    searchOptions: procs.list
      .input(z.object({ field: z.string(), search: z.string().optional(), selected: z.string().optional(), ids: z.array(z.string()).optional() }))
      .query(
        async ({ input, ctx }: { input: { field: string; search?: string; selected?: string; ids?: string[] }; ctx?: unknown }) => {
          const field = config.fields.find((f) => f.name === input.field);
          if (!field || field.type !== "select") {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid select field "${input.field}".` });
          }
          return resolveSelectOptionsForSearch(db, ctx, field, input.search, input.selected, input.ids);
        },
      ),

    getById: procs.getById
      .input(z.object({ id: z.string() }))
      .query(async ({ input }: { input: { id: string } }) => {
        const item = await db[model].findUnique({ where: { id: input.id }, ...(relInclude ? { include: relInclude } : {}) });
        if (!item) throw new TRPCError({ code: "NOT_FOUND" });
        return flattenRelations(config, item);
      }),
  };

  // readOnly: only expose list + getById
  if (config.readOnly) {
    return routerFn(readOnlyRouter);
  }

  return routerFn({
    ...readOnlyRouter,

    ...(config.creatable === false ? {} : { create: procs.create
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
        if (config.beforeCreate) await config.beforeCreate(input);
        const createData = applyGalleryWrites(
          config.fields,
          applyScheduleWrites(
            config.fields,
            applyRelationWrites(config.fields, applySlugFields(config.fields, input)),
          ),
        );
        await checkUnique(db, model, config.fields, createData);
        try {
          return await db[model].create({ data: createData });
        } catch (err) {
          handlePrismaError(err);
        }
      }) }),

    ...(config.editable === false ? {} : { update: procs.update
      .input(z.object({ id: z.string(), data: updateSchema }))
      .mutation(async ({ input }: { input: { id: string; data: Record<string, unknown> } }) => {
        if (config.beforeUpdate) await config.beforeUpdate(input.id, input.data);
        const updateData = applyGalleryWrites(
          config.fields,
          applyScheduleWrites(
            config.fields,
            applyRelationWrites(config.fields, applySlugFields(config.fields, input.data), true),
            true,
          ),
          true,
        );
        await checkUnique(db, model, config.fields, updateData, input.id);
        try {
          const scalarFields = assetFields(config.fields).filter((field) =>
            Object.prototype.hasOwnProperty.call(updateData, field.name),
          );
          const galleryFlds = galleryAssetFields(config.fields).filter((field) =>
            Object.prototype.hasOwnProperty.call(updateData, field.name),
          );
          const fieldsToTrack = [...scalarFields, ...galleryFlds];
          const previousValues = fieldsToTrack.length > 0
            ? await db[model].findUnique({
                where: { id: input.id },
                select: Object.fromEntries([
                  ...scalarFields.map((field) => [field.name, true]),
                  ...galleryFlds.map((field) => [field.name, { select: { url: true } }]),
                ]),
              })
            : null;
          const result = await db[model].update({ where: { id: input.id }, data: updateData });
          await cleanupReplacedAssets(options, config, input.id, previousValues, updateData);
          return result;
        } catch (err) {
          handlePrismaError(err);
        }
      }) }),

    ...(config.deletable === false ? {} : { delete: procs.delete
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
      }) }),
  });
}
