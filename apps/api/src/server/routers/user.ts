import { prisma } from "~/lib/db";
import bcrypt from "bcryptjs";
import { createPrismaAdapter } from "@repo/admin/server";
import { createUserRouter, createInviteRouter } from "@repo/admin/server";
import { router, mergeRouters, permissionProcedure } from "../trpc";
import { sendEmail } from "~/lib/email";

const db = createPrismaAdapter(prisma);

const userCrudRouter = createUserRouter(
  db,
  { router, permissionProcedure },
  { hash: bcrypt.hash, compare: bcrypt.compare },
);

const inviteRouter = createInviteRouter(
  db,
  { router, permissionProcedure },
  process.env.NEXTAUTH_URL,
  {
    async sendInvitationEmail({ email, inviteUrl }) {
      await sendEmail({
        to: email,
        subject: "You're invited to Quantyx",
        html: `
          <p>You have been invited to Quantyx.</p>
          <p><a href="${inviteUrl}">Accept your invitation</a></p>
          <p>This invitation link expires in 7 days.</p>
        `,
        text: `You have been invited to Quantyx.\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation link expires in 7 days.`,
      });
    },
  },
);

export const userRouter = mergeRouters(userCrudRouter, inviteRouter);
