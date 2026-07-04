import { prisma } from "~/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createPrismaAdapter } from "@repo/admin/server";
import { sha256 } from "@repo/admin/server";
import { publicProcedure } from "../trpc";

const db = createPrismaAdapter(prisma);

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

export const getInvitationProcedure = publicProcedure
  .input(z.object({ token: z.string() }))
  .query(async ({ input }) => {
    const invitation = await lookupInvitation(input.token);
    return { email: invitation.email as string };
  });

export const acceptInvitationProcedure = publicProcedure
  .input(z.object({
    token: z.string(),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }))
  .mutation(async ({ input }) => {
    const invitation = await lookupInvitation(input.token);
    const hashed = await bcrypt.hash(input.password, 10);

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
