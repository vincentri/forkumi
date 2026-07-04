import { describe, it, expect, vi } from "vitest";

const { mockFindUnique, mockCompare } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCompare: vi.fn(),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

vi.mock("@repo/db", () => ({
  prisma: { user: { findUnique: mockFindUnique } },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: mockCompare },
  compare: mockCompare,
}));

vi.mock("@repo/auth", () => ({
  createAuthOptions: (adapter: any) => {
    (globalThis as any).__authAdapter = adapter;
    return { providers: [], callbacks: {} };
  },
  createGetServerAuthSession: vi.fn(),
}));

import { authOptions } from "./auth";

describe("auth.ts module", () => {
  it("exports authOptions", () => {
    expect(authOptions).toBeDefined();
  });

  it("calls createAuthOptions with adapter", () => {
    expect((globalThis as any).__authAdapter).toBeDefined();
    expect(typeof (globalThis as any).__authAdapter.findUserByCredentials).toBe("function");
  });

  describe("findUserByCredentials adapter", () => {
    const adapter = () => (globalThis as any).__authAdapter;

    it("returns null when user not found", async () => {
      mockFindUnique.mockResolvedValue(null);
      const result = await adapter().findUserByCredentials("no@user.com", "pass");
      expect(result).toBeNull();
    });

    it("returns null when no password", async () => {
      mockFindUnique.mockResolvedValue({ password: null });
      const result = await adapter().findUserByCredentials("a@b.com", "pass");
      expect(result).toBeNull();
    });

    it("returns user when password valid", async () => {
      mockFindUnique.mockResolvedValue({
        id: "1", email: "a@b.com", name: "Test", password: "hashed",
        role: { name: "admin", permissions: ["user:view"], protected: true },
      });
      mockCompare.mockResolvedValue(true);
      const result = await adapter().findUserByCredentials("a@b.com", "correct");
      expect(result).toEqual({
        id: "1", email: "a@b.com", name: "Test",
        role: "admin", permissions: ["user:view"], isProtectedRole: true,
      });
    });

    it("returns null when password invalid", async () => {
      mockFindUnique.mockResolvedValue({
        id: "1", email: "a@b.com", password: "hashed", role: null,
      });
      mockCompare.mockResolvedValue(false);
      const result = await adapter().findUserByCredentials("a@b.com", "wrong");
      expect(result).toBeNull();
    });

    it("handles missing role", async () => {
      mockFindUnique.mockResolvedValue({
        id: "2", email: "b@b.com", name: null, password: "hashed", role: null,
      });
      mockCompare.mockResolvedValue(true);
      const result = await adapter().findUserByCredentials("b@b.com", "pass");
      expect(result).toEqual({
        id: "2", email: "b@b.com", name: null,
        role: null, permissions: [], isProtectedRole: false,
      });
    });
  });
});
