import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { createPrismaAdapter } from "@repo/admin/server";
import { createUserRouter } from "@repo/admin/server";
import { router, permissionProcedure } from "../trpc";

const db = createPrismaAdapter(prisma);

export const userRouter = createUserRouter(
  db,
  { router, permissionProcedure },
  { hash: bcrypt.hash, compare: bcrypt.compare },
  process.env.NEXTAUTH_URL,
);
