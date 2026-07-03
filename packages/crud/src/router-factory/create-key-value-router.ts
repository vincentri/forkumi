import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { CRUDConfig, CRUDFieldSelect, CRUDRouterOptions, PrismaLikeClient, SelectOption } from "../types";
import { cleanupReplacedAssets } from "./assets";
import { prismaModelKey } from "./relations";
import { resolveSelectOptions, resolveSelectOptionsForSearch } from "./select-options";
import type { AnyProcedureBuilder, AnyRouterBuilder } from "./procedures";

/**
 * Create a tRPC router for a keyValue-style resource (e.g. Settings).
 * Exposes `get`, `update`, `options`, `searchOptions`. No list — keyValue stores
 * a single record of `key: value` pairs.
 */
export function createKeyValueRouter(
  config: CRUDConfig,
  routerFn: AnyRouterBuilder,
  procedure: AnyProcedureBuilder,
  prismaClient: PrismaLikeClient,
  options?: CRUDRouterOptions,
) {
  const missingNamespace = config.fields.filter((f) => !f.namespace);
  if (missingNamespace.length > 0) {
    console.warn(
      `[crud] keyValue config "${config.model}": fields missing namespace: ${missingNamespace.map((f) => `"${f.name}"`).join(", ")}`,
    );
  }

  const model = prismaModelKey(config.model);
  const db = prismaClient as PrismaLikeClient;

  const fieldKeys = config.fields.map((field) => field.name);

  return routerFn({
    get: procedure.query(async () => {
      const rows = await db[model].findMany({
        where: { key: { in: fieldKeys } },
      });
      return Object.fromEntries(rows.map((r: { key: string; value: string | null }) => [r.key, r.value ?? ""]));
    }),
    options: procedure.query(async ({ ctx }: { ctx?: unknown }) => {
      const selectFields = config.fields.filter(
        (field): field is CRUDFieldSelect => field.type === "select" && !!field.optionsQuery,
      );
      const entries = await Promise.all(
        selectFields.map(async (field) => [field.name, await resolveSelectOptions(db, ctx, field)] as const),
      );
      return Object.fromEntries(entries) as Record<string, SelectOption[]>;
    }),
    searchOptions: procedure
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
    update: procedure
      .input(z.object({ data: z.record(z.string(), z.string()) }))
      .mutation(async ({ input }: { input: { data: Record<string, string> } }) => {
        const previousRows = await db[model].findMany({
          where: { key: { in: Object.keys(input.data) } },
        });
        const previousValues = Object.fromEntries(previousRows.map((row: { key: string; value: unknown }) => [row.key, row.value]));

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
        await cleanupReplacedAssets(options, config, undefined, previousValues, input.data);
        return { ok: true };
      }),
  });
}
