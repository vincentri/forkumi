import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { handlePrismaError } from "@repo/crud";
import type { AdminDbAdapter } from "../adapters";

const permissionString = z.string().regex(
  /^(\*|[a-z]+):[a-z]+$/,
  "Permission must be 'model:action' or '*:action' (e.g. 'user:view', '*:create')",
);

export function createRoleRouter(
  db: AdminDbAdapter,
  trpc: { router: any; permissionProcedure: (action: string, model?: string) => any },
) {
  const roleCreateProcedure = trpc.permissionProcedure("create", "role")
    .input(z.object({
      name: z.string(),
      permissions: z.array(permissionString).default([]),
      protected: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      try {
        const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
        if (input.protected && !callerIsProtected) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot create a protected role." });
        }
        return await db.role.create({ data: input });
      } catch (err) {
        handlePrismaError(err);
      }
    });

  const roleUpdateProcedure = trpc.permissionProcedure("update", "role")
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        permissions: z.array(permissionString).optional(),
        protected: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      try {
        const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
        const existing = await db.role.findUnique({ where: { id: input.id } });
        if (existing?.protected && !callerIsProtected) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot modify a protected role." });
        }
        if (input.data.protected && !callerIsProtected) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot set a role as protected." });
        }
        return await db.role.update({ where: { id: input.id }, data: input.data });
      } catch (err) {
        handlePrismaError(err);
      }
    });

  const roleDeleteProcedure = trpc.permissionProcedure("delete", "role")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      try {
        const [assignedCount, roleToDelete] = await Promise.all([
          db.user.count({ where: { roleId: input.id } }),
          db.role.findUnique({ where: { id: input.id } }),
        ]);
        const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
        if (roleToDelete?.protected && !callerIsProtected) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete a protected role." });
        }
        if (assignedCount > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Cannot delete role — ${assignedCount} user${assignedCount === 1 ? "" : "s"} assigned. Reassign users first.`,
          });
        }
        return await db.role.delete({ where: { id: input.id } });
      } catch (err) {
        handlePrismaError(err);
      }
    });

  return { roleCreateProcedure, roleUpdateProcedure, roleDeleteProcedure };
}
