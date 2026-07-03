import crypto from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { AdminDbAdapter } from "../adapters";
import type { StandardAction } from "../../lib/permissions";
import { sha256 } from "../utils";

export interface InvitationRouterOptions {
  sendInvitationEmail?: (args: { email: string; inviteUrl: string }) => Promise<void>;
}

interface RouterDeps {
  router: any;
  permissionProcedure: (action: StandardAction, model?: string) => any;
}

/**
 * Resolve the user id of the current session user so we can record who sent the invitation.
 * Falls back to null if the session user cannot be looked up.
 */
async function getInviteSenderId(
  db: AdminDbAdapter,
  sessionUser: { id?: string | null; email?: string | null },
): Promise<string | null> {
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

function getAppUrl(appUrl?: string): string {
  return appUrl ?? "http://localhost:3001";
}

/**
 * Invitation management router.
 * Procedures: invite, resendInvite, sendInviteEmail, revokeInvite.
 */
export function createInviteRouter(
  db: AdminDbAdapter,
  trpc: RouterDeps,
  appUrl?: string,
  options?: InvitationRouterOptions,
) {
  const appUrlOrDefault = getAppUrl(appUrl);

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
      const invitedById = await getInviteSenderId(db, ctx.session.user);

      await db.userInvitation.create({
        data: {
          email: input.email,
          token: hashedToken,
          invitedById,
          roleId: input.roleId ?? null,
          expiresAt,
        },
      });

      const inviteUrl = `${appUrlOrDefault}/auth/accept-invite?token=${rawToken}`;
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
      const invitedById = await getInviteSenderId(db, ctx.session.user);

      await db.userInvitation.create({
        data: {
          email: input.email,
          token: hashedToken,
          invitedById,
          expiresAt,
        },
      });

      return { ok: true, inviteUrl: `${appUrlOrDefault}/auth/accept-invite?token=${rawToken}` };
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
    invite: inviteProcedure,
    resendInvite: resendInviteProcedure,
    sendInviteEmail: sendInviteEmailProcedure,
    revokeInvite: revokeInviteProcedure,
  });
}
