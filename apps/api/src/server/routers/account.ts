import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";
import { protectedProcedure, router } from "../trpc";

async function getCurrentUser(sessionUser: { id: string; email?: string | null }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: sessionUser.id },
        ...(sessionUser.email ? [{ email: sessionUser.email }] : []),
      ],
    },
    select: { id: true, name: true, email: true, password: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Your session no longer matches a user. Please sign in again.",
    });
  }

  return user;
}

export const accountRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getCurrentUser(ctx.session.user);
    return { id: user.id, name: user.name, email: user.email };
  }),

  updateProfile: protectedProcedure
    .input(z.object({ name: z.string().trim().min(1, "Name is required").max(100, "Name is too long") }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await getCurrentUser(ctx.session.user);
      const user = await prisma.user.update({
        where: { id: currentUser.id },
        data: { name: input.name },
        select: { id: true, name: true, email: true },
      });

      return user;
    }),

  updatePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await getCurrentUser(ctx.session.user);

      if (!user?.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This account does not have a password set." });
      }

      const isValid = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Current password is incorrect." });
      }

      const hashed = await bcrypt.hash(input.newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return { ok: true };
    }),
});
