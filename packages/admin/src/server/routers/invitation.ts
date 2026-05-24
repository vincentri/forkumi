import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { AdminDbAdapter } from "../adapters";
import type { PasswordHasher } from "../../types";
import { sha256 } from "../utils";

export function createInvitationRouter(
  db: AdminDbAdapter,
  trpc: { publicProcedure: any },
  passwordHasher: PasswordHasher,
) {
  async function lookupInvitation(token: string) {
    const hashedToken = sha256(token);
    const invitation = await db.userInvitation.findUnique({ where: { token: hashedToken } });
    if (!invitation || invitation.expiresAt < new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This invitation has expired. Ask an admin to send a new invite." });
    }
    if (invitation.acceptedAt) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This invitation link has already been used." });
    }
    return invitation;
  }

  const getInvitationProcedure = trpc.publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }: { input: any }) => {
      const invitation = await lookupInvitation(input.token);
      return { email: invitation.email as string };
    });

  const acceptInvitationProcedure = trpc.publicProcedure
    .input(z.object({
      token: z.string(),
      name: z.string().min(1, "Name is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async ({ input }: { input: any }) => {
      const invitation = await lookupInvitation(input.token);
      const hashed = await passwordHasher.hash(input.password, 10);

      try {
        await db.user.create({
          data: {
            name: input.name,
            email: invitation.email,
            password: hashed,
            roleId: invitation.roleId ?? undefined,
          },
        });
        await db.userInvitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() },
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "This email address is already registered. Sign in instead." });
        }
        throw err;
      }

      return { ok: true };
    });

  return { getInvitationProcedure, acceptInvitationProcedure };
}
