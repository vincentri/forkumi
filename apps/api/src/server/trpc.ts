import { initTRPC, TRPCError } from "@trpc/server";
import { getServerAuthSession } from "~/lib/auth";
import type { StandardAction } from "@repo/admin";
import superjson from "superjson";
import { ZodError } from "zod";

export async function createTRPCContext() {
  const session = await getServerAuthSession();
  return { session };
}

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * Permission-scoped procedure — checks `model:action` or `*:action` in the user's role.
 * Users with `isProtectedRole: true` (super admin) bypass all checks.
 * Users with no role have no permissions and always get FORBIDDEN.
 *
 * Permission format: "user:view", "product:create", "*:view" (wildcard = all models).
 * Legacy format ("view", "create") is not supported — update seed and existing roles.
 */
export function permissionProcedure(action: StandardAction, model?: string) {
  return protectedProcedure.use(({ ctx, next }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = ctx.session.user as any;
    if (user?.isProtectedRole) return next({ ctx }); // protected role = full bypass
    const perms: string[] = user?.permissions ?? [];
    const allowed = model
      ? perms.includes(`${model}:${action}`) || perms.includes(`*:${action}`)
      : perms.includes(`*:${action}`); // no model = wildcard-only match
    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Missing permission: ${model ? `${model}:${action}` : `*:${action}`}`,
      });
    }
    return next({ ctx });
  });
}
