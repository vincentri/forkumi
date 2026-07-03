import type { CRUDConfig, CRUDRouterOptions, PrismaLikeClient } from "../types";
import { createCRUDRouter } from "./create-crud-router";
import { createKeyValueRouter } from "./create-key-value-router";
import type { AnyProcedureBuilder, AnyRouterBuilder, ProcedureMap } from "./procedures";

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
  prismaClient: PrismaLikeClient,
  options?: CRUDRouterOptions,
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
            options,
          )
        : createCRUDRouter(
            config,
            routerFn,
            typeof procedure === "function" ? procedure(config) : procedure,
            prismaClient,
            options,
          ),
    ]),
  );
}
