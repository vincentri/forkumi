import { describe, it, expect, vi } from "vitest";
import { z, ZodError } from "zod";

vi.mock("~/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("superjson", () => ({
  default: { serialize: (v: unknown) => v, deserialize: (v: unknown) => v },
}));

import { createTRPCContext, permissionProcedure, protectedProcedure, publicProcedure, router, t } from "./trpc";

function createCaller(testRouter: any, ctx: any) {
  return t.createCallerFactory(testRouter)(ctx) as any;
}

describe("createTRPCContext", () => {
  it("returns session from getServerAuthSession", async () => {
    const { getServerAuthSession } = await import("~/lib/auth");
    vi.mocked(getServerAuthSession).mockResolvedValue({ user: { id: "1" } } as any);
    const ctx = await createTRPCContext();
    expect(ctx.session).toEqual({ user: { id: "1" } });
  });
});

describe("protectedProcedure", () => {
  it("throws UNAUTHORIZED when no session user", async () => {
    const r = router({ test: protectedProcedure.query(() => "ok") });
    const caller = createCaller(r, { session: null });
    await expect(caller.test()).rejects.toThrow();
  });

  it("passes when session user exists", async () => {
    const r = router({ test: protectedProcedure.query(({ ctx }) => ctx.session.user) });
    const caller = createCaller(r, { session: { user: { id: "1" } } });
    const result = await caller.test();
    expect(result).toEqual({ id: "1" });
  });
});

describe("permissionProcedure", () => {
  it("allows protected role bypass", async () => {
    const r = router({ test: permissionProcedure("view", "user").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: true } } });
    expect(await caller.test()).toBe("ok");
  });

  it("allows exact model:action match", async () => {
    const r = router({ test: permissionProcedure("view", "user").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false, permissions: ["user:view"] } } });
    expect(await caller.test()).toBe("ok");
  });

  it("allows wildcard *:action match", async () => {
    const r = router({ test: permissionProcedure("view", "user").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false, permissions: ["*:view"] } } });
    expect(await caller.test()).toBe("ok");
  });

  it("throws FORBIDDEN when no matching permission", async () => {
    const r = router({ test: permissionProcedure("delete", "user").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false, permissions: ["user:view"] } } });
    await expect(caller.test()).rejects.toThrow();
  });

  it("allows wildcard-only with no model", async () => {
    const r = router({ test: permissionProcedure("view").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false, permissions: ["*:view"] } } });
    expect(await caller.test()).toBe("ok");
  });

  it("throws FORBIDDEN when no model and no wildcard", async () => {
    const r = router({ test: permissionProcedure("view").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false, permissions: ["user:view"] } } });
    await expect(caller.test()).rejects.toThrow();
  });

  it("throws FORBIDDEN when user has no permissions", async () => {
    const r = router({ test: permissionProcedure("view", "user").query(() => "ok") });
    const caller = createCaller(r, { session: { user: { isProtectedRole: false } } });
    await expect(caller.test()).rejects.toThrow();
  });
});

describe("router", () => {
  it("creates a router with procedures", () => {
    const r = router({ hello: publicProcedure.query(() => "world") });
    expect(r).toBeDefined();
  });

  it("formats ZodError in error response", async () => {
    const r = router({
      test: publicProcedure
        .input(z.object({ name: z.string().min(1) }))
        .query(() => "ok"),
    });
    const caller = createCaller(r, {});
    await expect(caller.test({ name: "" } as any)).rejects.toThrow();
  });

  it("errorFormatter includes zodError for ZodError causes", () => {
    const formatter = (t as any)._config.errorFormatter;
    const shape = {
      message: "Bad input",
      code: "BAD_REQUEST" as const,
      data: { code: "BAD_REQUEST", httpStatus: 400, zodError: null },
    };
    const zodError = new ZodError([
      { code: "too_small", minimum: 1, inclusive: true, path: ["name"], message: "Required" } as any,
    ]);
    const result = formatter({ shape, error: { cause: zodError } as any });
    expect(result.data.zodError).toBeDefined();
    expect(result.data.zodError!.fieldErrors.name).toContain("Required");
  });

  it("errorFormatter returns null zodError for non-ZodError causes", () => {
    const formatter = (t as any)._config.errorFormatter;
    const shape = {
      message: "Server error",
      code: "INTERNAL_SERVER_ERROR" as const,
      data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500, zodError: null },
    };
    const result = formatter({ shape, error: { cause: new Error("other") } as any });
    expect(result.data.zodError).toBeNull();
  });
});
