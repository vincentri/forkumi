import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { handlePrismaError } from "@repo/crud";
import type { AdminDbAdapter } from "../adapters";
import type { PasswordHasher } from "../../types";
import type { StandardAction } from "../../lib/permissions";

interface RouterDeps {
  router: any;
  permissionProcedure: (action: StandardAction, model?: string) => any;
}

export function createUserRouter(
  db: AdminDbAdapter,
  trpc: RouterDeps,
  passwordHasher: PasswordHasher,
) {
  const userListProcedure = trpc.permissionProcedure("view", "user")
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
      sortField: z.string().optional(),
      sortDir: z.enum(["asc", "desc"]).optional(),
    }))
    .query(async ({ input }: { input: any }) => {
      const { page, pageSize, search, sortField, sortDir } = input;
      const skip = (page - 1) * pageSize;
      const where = search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
        : {};
      const validSort = ["name", "email", "createdAt"].includes(sortField) ? sortField : "createdAt";
      const orderBy = { [validSort]: sortDir ?? "desc" };
      const [rawItems, total] = await Promise.all([
        db.user.findMany({ where, skip, take: pageSize, orderBy, select: { id: true, name: true, email: true, password: true, roleId: true, createdAt: true, updatedAt: true, role: { select: { id: true, name: true, protected: true } } } }),
        db.user.count({ where }),
      ]);

      const now = new Date();
      const allPendingInvites: any[] = await db.userInvitation.findMany({
        where: { acceptedAt: null, expiresAt: { gt: now } },
        select: { id: true, email: true, roleId: true, role: { select: { name: true } }, createdAt: true, expiresAt: true },
      });

      const registeredEmails = new Set(rawItems.map((u: any) => u.email).filter(Boolean));
      const pendingByEmail = new Map(allPendingInvites.map((inv) => [inv.email, inv]));

      const userItems = rawItems.map((u: any) => ({
        ...u,
        roleName: u.role?.name ?? null,
        password: undefined,
        hasPendingInvite: pendingByEmail.has(u.email),
      }));

      const inviteRows = allPendingInvites
        .filter((inv) => !registeredEmails.has(inv.email))
        .map((inv) => ({
          id: inv.id,
          name: null,
          email: inv.email,
          roleName: inv.role?.name ?? null,
          roleId: inv.roleId,
          createdAt: inv.createdAt,
          updatedAt: inv.createdAt,
          hasPendingInvite: true,
          isPendingInvite: true,
          protected: true,
          password: undefined,
        }));

      const items = [...inviteRows, ...userItems];
      return { items, total: total + inviteRows.length, page, pageSize, totalPages: Math.ceil((total + inviteRows.length) / pageSize) };
    });

  const userGetByIdProcedure = trpc.permissionProcedure("view", "user")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: { input: any }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const { password: _pw, ...safe } = user;
      return safe;
    });

  const userCreateProcedure = trpc.permissionProcedure("create", "user")
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      try {
        const hashed = await passwordHasher.hash(input.password, 10);
        const result = await db.user.create({
          data: { name: input.name, email: input.email, password: hashed },
        });
        const { password: _pw, ...safe } = result;
        return safe;
      } catch (err) {
        handlePrismaError(err);
      }
    });

  const userUpdateProcedure = trpc.permissionProcedure("update", "user")
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        roleId: z.string().nullable().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      try {
        const { password, roleId, ...rest } = input.data;
        const data: Record<string, unknown> = { ...rest };
        if (password) {
          data.password = await passwordHasher.hash(password, 10);
        }
        if (roleId !== undefined) {
          if (roleId) {
            const targetRole = await db.role.findUnique({ where: { id: roleId } });
            const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
            if (targetRole?.protected && !callerIsProtected) {
              throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign a protected role." });
            }
          }
          data.roleId = roleId;
        }
        const result = await db.user.update({ where: { id: input.id }, data });
        const { password: _pw, ...safe } = result;
        return safe;
      } catch (err) {
        handlePrismaError(err);
      }
    });

  const userDeleteProcedure = trpc.permissionProcedure("delete", "user")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      if (ctx.session.user.id === input.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete your own account" });
      }
      const targetUser = await db.user.findUnique({
        where: { id: input.id },
        select: { role: { select: { protected: true } } },
      });
      const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
      if (targetUser?.role?.protected && !callerIsProtected) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete a user with a protected role." });
      }
      return await db.user.delete({ where: { id: input.id } });
    });

  return trpc.router({
    list: userListProcedure,
    getById: userGetByIdProcedure,
    create: userCreateProcedure,
    update: userUpdateProcedure,
    delete: userDeleteProcedure,
  });
}
