import crypto from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { handlePrismaError } from "@repo/crud";
import type { AdminDbAdapter } from "../adapters";
import type { PasswordHasher } from "../../types";
import { sha256 } from "../utils";

interface UserRouterOptions {
  sendInvitationEmail?: (args: { email: string; inviteUrl: string }) => Promise<void>;
}

export function createUserRouter(
  db: AdminDbAdapter,
  trpc: { router: any; permissionProcedure: (action: string, model?: string) => any },
  passwordHasher: PasswordHasher,
  appUrl?: string,
  options?: UserRouterOptions,
) {
  const getAppUrl = () => appUrl ?? "http://localhost:3001";

  async function getInviteSenderId(sessionUser: { id?: string | null; email?: string | null }): Promise<string | null> {
    if (sessionUser.id) {
      const user = await db.user.findUnique({ where: { id: sessionUser.id } });
      if (user) return user.id;
    }

    if (sessionUser.email) {
      const user = await db.user.findUnique({ where: { email: sessionUser.email } });
      if (user) return user.id;
    }

    return null;
  }

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
        db.user.findMany({ where, skip, take: pageSize, orderBy, select: { id: true, name: true, email: true, emailVerified: true, password: true, roleId: true, createdAt: true, updatedAt: true, role: { select: { id: true, name: true, protected: true } } } }),
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
          emailVerified: null,
        }));

      const items = [...inviteRows, ...userItems];
      return { items, total: total + inviteRows.length, page, pageSize, totalPages: Math.ceil((total + inviteRows.length) / pageSize) };
    });

  const userGetByIdProcedure = trpc.permissionProcedure("read", "user")
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

  const inviteProcedure = trpc.permissionProcedure("create", "user")
    .input(z.object({
      email: z.string().email(),
      roleId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const existingUser = await db.user.findUnique({ where: { email: input.email } });
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already has an account." });
      }

      const existingInvite = await db.userInvitation.findUnique({ where: { email: input.email } });
      if (existingInvite && existingInvite.expiresAt > new Date() && !existingInvite.acceptedAt) {
        throw new TRPCError({ code: "CONFLICT", message: "Invitation already pending for this address." });
      }
      if (existingInvite) {
        await db.userInvitation.delete({ where: { id: existingInvite.id } });
      }

      if (input.roleId) {
        const targetRole = await db.role.findUnique({ where: { id: input.roleId } });
        const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
        if (targetRole?.protected && !callerIsProtected) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign a protected role." });
        }
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitedById = await getInviteSenderId(ctx.session.user);

      await db.userInvitation.create({
        data: {
          email: input.email,
          token: hashedToken,
          invitedById,
          roleId: input.roleId ?? null,
          expiresAt,
        },
      });

      const inviteUrl = `${getAppUrl()}/auth/accept-invite?token=${rawToken}`;
      return { ok: true, inviteUrl };
    });

  const resendInviteProcedure = trpc.permissionProcedure("create", "user")
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const existingUser = await db.user.findUnique({ where: { email: input.email } });
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already has an account." });
      }

      const existingInvite = await db.userInvitation.findUnique({ where: { email: input.email } });
      if (existingInvite) {
        await db.userInvitation.delete({ where: { id: existingInvite.id } });
      }

      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = sha256(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invitedById = await getInviteSenderId(ctx.session.user);

      await db.userInvitation.create({
        data: {
          email: input.email,
          token: hashedToken,
          invitedById,
          expiresAt,
        },
      });

      return { ok: true, inviteUrl: `${getAppUrl()}/auth/accept-invite?token=${rawToken}` };
    });

  const sendInviteEmailProcedure = trpc.permissionProcedure("create", "user")
    .input(z.object({
      email: z.string().email(),
      inviteUrl: z.string().url(),
    }))
    .mutation(async ({ input }: { input: any }) => {
      if (!options?.sendInvitationEmail) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Email delivery is not configured." });
      }

      const token = new URL(input.inviteUrl).searchParams.get("token");
      if (!token) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation URL is missing a token." });
      }

      const invitation = await db.userInvitation.findUnique({ where: { email: input.email } });
      if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active invitation exists for this email." });
      }

      if (invitation.token !== sha256(token)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation URL does not match the active invitation." });
      }

      await options.sendInvitationEmail({ email: input.email, inviteUrl: input.inviteUrl });
      return { ok: true };
    });

  const revokeInviteProcedure = trpc.permissionProcedure("delete", "user")
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }: { input: any }) => {
      const invite = await db.userInvitation.findUnique({ where: { email: input.email } });
      if (!invite) throw new TRPCError({ code: "NOT_FOUND", message: "No pending invitation found for this email." });
      await db.userInvitation.delete({ where: { email: input.email } });
      return { ok: true };
    });

  return trpc.router({
    list: userListProcedure,
    getById: userGetByIdProcedure,
    create: userCreateProcedure,
    update: userUpdateProcedure,
    delete: userDeleteProcedure,
    invite: inviteProcedure,
    resendInvite: resendInviteProcedure,
    sendInviteEmail: sendInviteEmailProcedure,
    revokeInvite: revokeInviteProcedure,
  });
}
