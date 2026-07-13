import { createAuthOptions, createGetServerAuthSession } from "@repo/auth";
import { prisma } from "@repo/db";
import { cache } from "react";

export const authOptions = createAuthOptions({
  async findUserByCredentials(email, password) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (prisma.user.findUnique as any)({
      where: { email },
      include: { role: true },
    });

    if (!user?.password) return null;

    const bcrypt = await import("bcryptjs");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = user.role as any;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role?.name ?? null,
      permissions: role?.permissions ?? [],
      isProtectedRole: role?.protected ?? false,
    };
  },
});

export const getServerAuthSession = cache(createGetServerAuthSession(authOptions));
