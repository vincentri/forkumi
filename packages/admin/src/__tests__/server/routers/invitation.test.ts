import { describe, it, expect, vi, beforeEach } from "vitest";
import { createInvitationRouter } from "../../../server/routers/invitation";
import type { AdminDbAdapter } from "../../../server/adapters";

function mockDb() {
  return {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    },
    role: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    userInvitation: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
  } as unknown as AdminDbAdapter;
}

function mockTrpc() {
  return {
    publicProcedure: {
      input: vi.fn().mockReturnThis(),
      query: vi.fn().mockImplementation((fn) => fn),
      mutation: vi.fn().mockImplementation((fn) => fn),
    },
  };
}

function mockPasswordHasher() {
  return {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockResolvedValue(true),
  };
}

describe("createInvitationRouter", () => {
  describe("getInvitationProcedure", () => {
    it("returns email for valid token", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { getInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "test@example.com",
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
      });

      const result = await getInvitationProcedure({ input: { token: "raw-token" } });
      expect(result).toEqual({ email: "test@example.com" });
      expect((db as any).userInvitation.findUnique).toHaveBeenCalled();
    });

    it("throws for expired token", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { getInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "test@example.com",
        expiresAt: new Date(Date.now() - 86400000),
        acceptedAt: null,
      });

      await expect(
        getInvitationProcedure({ input: { token: "expired" } }),
      ).rejects.toThrow("This invitation has expired.");
    });

    it("throws for already accepted invitation", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { getInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "test@example.com",
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: new Date(),
      });

      await expect(
        getInvitationProcedure({ input: { token: "used" } }),
      ).rejects.toThrow("This invitation link has already been used.");
    });

    it("throws for non-existent token", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { getInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue(null);

      await expect(
        getInvitationProcedure({ input: { token: "nope" } }),
      ).rejects.toThrow("This invitation has expired.");
    });
  });

  describe("acceptInvitationProcedure", () => {
    it("creates user and marks invitation accepted", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { acceptInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "new@example.com",
        roleId: "role1",
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
      });
      (db as any).user.create.mockResolvedValue({ id: "u1" });
      (db as any).userInvitation.update.mockResolvedValue({});

      const result = await acceptInvitationProcedure({
        input: { token: "raw-token", name: "New User", password: "password123" },
      });

      expect(result).toEqual({ ok: true });
      expect(hasher.hash).toHaveBeenCalledWith("password123", 10);
      expect((db as any).user.create).toHaveBeenCalledWith({
        data: {
          name: "New User",
          email: "new@example.com",
          password: "hashed-password",
          roleId: "role1",
        },
      });
      expect((db as any).userInvitation.update).toHaveBeenCalledWith({
        where: { id: "inv1" },
        data: { acceptedAt: expect.any(Date) },
      });
    });

    it("throws CONFLICT on P2002 unique constraint error", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { acceptInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "dup@example.com",
        roleId: null,
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
      });
      const p2002Error = Object.assign(new Error("Unique constraint"), { code: "P2002" });
      (db as any).user.create.mockRejectedValue(p2002Error);

      await expect(
        acceptInvitationProcedure({
          input: { token: "raw", name: "Dup", password: "password123" },
        }),
      ).rejects.toThrow("This email address is already registered.");
    });

    it("rethrows non-P2002 errors", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const { acceptInvitationProcedure } = createInvitationRouter(db, trpc, hasher);

      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        email: "x@y.com",
        roleId: null,
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
      });
      (db as any).user.create.mockRejectedValue(new Error("DB error"));

      await expect(
        acceptInvitationProcedure({
          input: { token: "raw", name: "X", password: "password123" },
        }),
      ).rejects.toThrow("DB error");
    });
  });
});
