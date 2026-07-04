import { prisma } from "~/lib/db";
import { createPrismaAdapter } from "@repo/admin/server";
import { createRoleRouter } from "@repo/admin/server";
import { router, permissionProcedure } from "../trpc";

const db = createPrismaAdapter(prisma);

export const roleRouter = createRoleRouter(db, { router, permissionProcedure });
