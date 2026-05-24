import { prisma } from "@repo/db";
import { createPrismaAdapter } from "@repo/admin/server";
import { createRoleRouter } from "@repo/admin/server";
import { router, permissionProcedure } from "../trpc";

const db = createPrismaAdapter(prisma);

export const { roleCreateProcedure, roleUpdateProcedure, roleDeleteProcedure } =
  createRoleRouter(db, { router, permissionProcedure });
