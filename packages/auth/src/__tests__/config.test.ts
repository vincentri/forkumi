import { describe, it, expect, vi } from "vitest";
import { createAuthOptions, type AuthAdapter, type AuthUser } from "../config";

function mockAdapter(user: AuthUser | null = null): AuthAdapter {
  return { findUserByCredentials: vi.fn().mockResolvedValue(user) };
}

const TEST_USER: AuthUser = {
  id: "u1",
  email: "test@example.com",
  name: "Test",
  role: "admin",
  permissions: ["user:view", "user:create"],
  isProtectedRole: false,
};

describe("createAuthOptions", () => {
  describe("session config", () => {
    it("uses JWT strategy", () => {
      const opts = createAuthOptions(mockAdapter());
      expect(opts.session?.strategy).toBe("jwt");
    });

    it("sets maxAge to 24 hours", () => {
      const opts = createAuthOptions(mockAdapter());
      expect(opts.session?.maxAge).toBe(24 * 60 * 60);
    });

    it("sets updateAge to 1 hour", () => {
      const opts = createAuthOptions(mockAdapter());
      expect(opts.session?.updateAge).toBe(60 * 60);
    });
  });

  describe("pages config", () => {
    it("sets signIn page", () => {
      const opts = createAuthOptions(mockAdapter());
      expect(opts.pages?.signIn).toBe("/auth/signin");
    });
  });

  describe("providers", () => {
    it("has one credentials provider", () => {
      const opts = createAuthOptions(mockAdapter());
      expect(opts.providers).toHaveLength(1);
    });
  });

  describe("jwt callback", () => {
    function getJwtCallback() {
      const opts = createAuthOptions(mockAdapter());
      return opts.callbacks!.jwt!;
    }

    it("maps user fields to token on sign-in", () => {
      const jwt = getJwtCallback();
      const token = {} as any;
      const result = jwt({ token, user: TEST_USER as any, trigger: "signIn", account: null, session: undefined });
      expect(result.id).toBe("u1");
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test");
      expect(result.role).toBe("admin");
      expect(result.permissions).toEqual(["user:view", "user:create"]);
      expect(result.isProtectedRole).toBe(false);
    });

    it("defaults missing user fields", () => {
      const jwt = getJwtCallback();
      const token = {} as any;
      const minimalUser = { id: "u2", email: "a@b.com" } as any;
      const result = jwt({ token, user: minimalUser, trigger: "signIn", account: null, session: undefined });
      expect(result.name).toBeNull();
      expect(result.role).toBeNull();
      expect(result.permissions).toEqual([]);
      expect(result.isProtectedRole).toBe(false);
    });

    it("preserves token on non-user calls", () => {
      const jwt = getJwtCallback();
      const token = { id: "u1", name: "Test" } as any;
      const result = jwt({ token, user: undefined, trigger: "signIn", account: null, session: undefined });
      expect(result.id).toBe("u1");
      expect(result.name).toBe("Test");
    });

    it("updates name on trigger=update", () => {
      const jwt = getJwtCallback();
      const token = { id: "u1", name: "Old" } as any;
      const result = jwt({ token, user: undefined, trigger: "update", account: null, session: { name: "New" } });
      expect(result.name).toBe("New");
    });

    it("does not update name when session.name is not a string", () => {
      const jwt = getJwtCallback();
      const token = { id: "u1", name: "Old" } as any;
      const result = jwt({ token, user: undefined, trigger: "update", account: null, session: {} });
      expect(result.name).toBe("Old");
    });
  });

  describe("session callback", () => {
    function getSessionCallback() {
      const opts = createAuthOptions(mockAdapter());
      return opts.callbacks!.session!;
    }

    it("maps token fields to session.user", () => {
      const sessionCb = getSessionCallback();
      const session = { user: {} } as any;
      const token = {
        id: "u1",
        email: "test@example.com",
        name: "Test",
        role: "admin",
        permissions: ["user:view"],
        isProtectedRole: true,
      } as any;
      const result = sessionCb({ session, token, user: {} as any });
      expect(result.user.id).toBe("u1");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test");
      expect(result.user.role).toBe("admin");
      expect(result.user.permissions).toEqual(["user:view"]);
      expect(result.user.isProtectedRole).toBe(true);
    });

    it("defaults missing token fields", () => {
      const sessionCb = getSessionCallback();
      const session = { user: {} } as any;
      const token = {} as any;
      const result = sessionCb({ session, token, user: {} as any });
      expect(result.user.id).toBeUndefined();
      expect(result.user.role).toBeNull();
      expect(result.user.permissions).toEqual([]);
      expect(result.user.isProtectedRole).toBe(false);
    });

    it("skips mapping if session.user is falsy", () => {
      const sessionCb = getSessionCallback();
      const session = {} as any;
      const token = { id: "u1" } as any;
      const result = sessionCb({ session, token, user: {} as any });
      expect(result.user).toBeUndefined();
    });
  });

  describe("authorize", () => {
    it("returns null when credentials are missing", async () => {
      const adapter = mockAdapter(TEST_USER);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize(null, {} as any);
      expect(result).toBeNull();
    });

    it("returns null when email is missing", async () => {
      const adapter = mockAdapter(TEST_USER);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize({ password: "pass" } as any, {} as any);
      expect(result).toBeNull();
    });

    it("returns null when password is missing", async () => {
      const adapter = mockAdapter(TEST_USER);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize({ email: "a@b.com" } as any, {} as any);
      expect(result).toBeNull();
    });

    it("returns null when adapter returns null", async () => {
      const adapter = mockAdapter(null);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize({ email: "a@b.com", password: "wrong" } as any, {} as any);
      expect(result).toBeNull();
      expect(adapter.findUserByCredentials).toHaveBeenCalledWith("a@b.com", "wrong");
    });

    it("maps user fields from adapter result", async () => {
      const adapter = mockAdapter(TEST_USER);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize({ email: "test@example.com", password: "pass" } as any, {} as any);
      expect(result).toEqual({
        id: "u1",
        email: "test@example.com",
        name: "Test",
        role: "admin",
        permissions: ["user:view", "user:create"],
        isProtectedRole: false,
      });
    });

    it("defaults optional fields when adapter user has nulls", async () => {
      const userWithNulls: AuthUser = { id: "u3", email: "x@y.com" };
      const adapter = mockAdapter(userWithNulls);
      const opts = createAuthOptions(adapter);
      const provider = opts.providers[0] as any;
      const result = await provider.options.authorize({ email: "x@y.com", password: "pass" } as any, {} as any);
      expect(result!.name).toBeNull();
      expect(result!.role).toBeNull();
      expect(result!.permissions).toEqual([]);
      expect(result!.isProtectedRole).toBe(false);
    });
  });
});
