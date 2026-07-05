import { describe, it, expect, vi } from "vitest";
import { createUserRouter } from "../../../server/routers/user";
import { createInviteRouter } from "../../../server/routers/invite";
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
  const handler = vi.fn().mockImplementation((_action?: string, _model?: string) => ({
    input: vi.fn().mockReturnThis(),
    mutation: vi.fn().mockImplementation((fn) => fn),
    query: vi.fn().mockImplementation((fn) => fn),
  }));
  return {
    router: vi.fn().mockImplementation((routes: any) => routes),
    permissionProcedure: handler,
  };
}

function mockPasswordHasher() {
  return {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn().mockResolvedValue(true),
  };
}

describe("createUserRouter", () => {
  describe("list", () => {
    it("returns paginated users", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: {} } };
      (db as any).user.findMany.mockResolvedValue([{ id: "u1", name: "Test" }]);
      (db as any).user.count.mockResolvedValue(1);

      const result = await (router as any).list({ ctx, input: { page: 1, pageSize: 20 } });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("u1");
      expect(result.items[0].hasPendingInvite).toBe(false);
      expect(result.items[0].password).toBeUndefined();
      expect(result.total).toBe(1);
    });

    // Regression: the findMany `select` must only reference real User columns.
    // A stale `emailVerified` (dropped from the schema) made admin.user.list
    // 500 against real Prisma even though the mock-based test above passed.
    it("findMany select only references existing User fields", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: {} } };

      await (router as any).list({ ctx, input: { page: 1, pageSize: 20 } });

      const select = (db as any).user.findMany.mock.calls[0][0].select as Record<string, unknown>;
      const knownUserFields = ["id", "email", "name", "password", "roleId", "createdAt", "updatedAt"];
      for (const field of Object.keys(select)) {
        if (field === "role") continue;
        expect(knownUserFields).toContain(field);
      }
      expect(select).not.toHaveProperty("emailVerified");
    });
  });

  describe("create", () => {
    it("hashes password on create", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: {} } };
      (db as any).user.create.mockResolvedValue({ id: "u1", name: "A", email: "a@b.com", password: "hashed" });

      const result = await (router as any).create({
        ctx,
        input: { name: "A", email: "a@b.com", password: "password123" },
      });
      expect(hasher.hash).toHaveBeenCalledWith("password123", 10);
      expect(result.password).toBeUndefined();
    });
  });

  describe("update", () => {
    it("hashes password when provided", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { isProtectedRole: true } } };
      (db as any).user.update.mockResolvedValue({ id: "u1", password: "hashed" });

      await (router as any).update({
        ctx,
        input: { id: "u1", data: { password: "newpass123" } },
      });
      expect(hasher.hash).toHaveBeenCalledWith("newpass123", 10);
      expect((db as any).user.update).toHaveBeenCalled();
    });

    it("throws FORBIDDEN when non-protected caller assigns protected role", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: true });

      await expect(
        (router as any).update({
          ctx,
          input: { id: "u1", data: { roleId: "r1" } },
        }),
      ).rejects.toThrow("Cannot assign a protected role.");
    });

    it("allows setting roleId to null", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { isProtectedRole: true } } };
      (db as any).user.update.mockResolvedValue({ id: "u1" });

      await (router as any).update({
        ctx,
        input: { id: "u1", data: { roleId: null } },
      });
      expect((db as any).user.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("throws FORBIDDEN when deleting own account", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { id: "u1" } } };

      await expect(
        (router as any).delete({ ctx, input: { id: "u1" } }),
      ).rejects.toThrow("Cannot delete your own account");
    });

    it("throws FORBIDDEN when target has protected role", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { id: "admin", isProtectedRole: false } } };
      (db as any).user.findUnique.mockResolvedValue({ role: { protected: true } });

      await expect(
        (router as any).delete({ ctx, input: { id: "u2" } }),
      ).rejects.toThrow("Cannot delete a user with a protected role.");
    });

    it("deletes user when allowed", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const hasher = mockPasswordHasher();
      const router = createUserRouter(db, trpc, hasher);
      const ctx = { session: { user: { id: "admin", isProtectedRole: true } } };
      (db as any).user.findUnique.mockResolvedValue({ role: { protected: false } });
      (db as any).user.delete.mockResolvedValue({ id: "u2" });

      const result = await (router as any).delete({ ctx, input: { id: "u2" } });
      expect(result).toEqual({ id: "u2" });
    });
  });

  describe("inviteProcedure", () => {
    function createInviteRouterForTest(appUrl?: string, options?: { sendInvitationEmail?: (args: { email: string; inviteUrl: string }) => Promise<void> }) {
      const db = mockDb();
      const trpc = mockTrpc();
      const router = createInviteRouter(db, trpc, appUrl, options);
      return { db, trpc, router };
    }

    it("creates invitation and returns inviteUrl", async () => {
      const { db, router } = createInviteRouterForTest("http://localhost:3001");
      const { invite: inviteProcedure } = router as any;
      const ctx = { session: { user: { id: "admin", email: "admin@e.com" } } };
      (db as any).user.findUnique.mockResolvedValue(null);
      (db as any).userInvitation.findUnique.mockResolvedValue(null);
      (db as any).userInvitation.create.mockResolvedValue({});

      const result = await inviteProcedure({ ctx, input: { email: "new@e.com" } });
      expect(result.ok).toBe(true);
      expect(result.inviteUrl).toContain("http://localhost:3001/auth/accept-invite?token=");
      expect((db as any).userInvitation.create).toHaveBeenCalled();
    });

    it("throws CONFLICT when user already exists", async () => {
      const { db, router } = createInviteRouterForTest();
      const { invite: inviteProcedure } = router as any;
      const ctx = { session: { user: { id: "admin", email: "admin@e.com" } } };
      (db as any).user.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        inviteProcedure({ ctx, input: { email: "existing@e.com" } }),
      ).rejects.toThrow("Email already has an account.");
    });

    it("throws CONFLICT when invitation already pending", async () => {
      const { db, router } = createInviteRouterForTest();
      const { invite: inviteProcedure } = router as any;
      const ctx = { session: { user: { id: "admin", email: "admin@e.com" } } };
      (db as any).user.findUnique.mockResolvedValue(null);
      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "inv1",
        expiresAt: new Date(Date.now() + 86400000),
        acceptedAt: null,
      });

      await expect(
        inviteProcedure({ ctx, input: { email: "pending@e.com" } }),
      ).rejects.toThrow("Invitation already pending for this address.");
    });

    it("deletes old invitation before creating new one", async () => {
      const { db, router } = createInviteRouterForTest();
      const { invite: inviteProcedure } = router as any;
      const ctx = { session: { user: { id: "admin", email: "admin@e.com" } } };
      (db as any).user.findUnique.mockResolvedValue(null);
      (db as any).userInvitation.findUnique.mockResolvedValue({
        id: "old-inv",
        expiresAt: new Date(Date.now() - 86400000),
        acceptedAt: null,
      });
      (db as any).userInvitation.delete.mockResolvedValue({});
      (db as any).userInvitation.create.mockResolvedValue({});

      await inviteProcedure({ ctx, input: { email: "retry@e.com" } });
      expect((db as any).userInvitation.delete).toHaveBeenCalledWith({ where: { id: "old-inv" } });
    });

    it("throws FORBIDDEN when assigning protected role as non-protected", async () => {
      const { db, router } = createInviteRouterForTest();
      const { invite: inviteProcedure } = router as any;
      const ctx = { session: { user: { id: "admin", isProtectedRole: false } } };
      (db as any).user.findUnique.mockResolvedValue(null);
      (db as any).userInvitation.findUnique.mockResolvedValue(null);
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: true });

      await expect(
        inviteProcedure({ ctx, input: { email: "x@e.com", roleId: "r1" } }),
      ).rejects.toThrow("Cannot assign a protected role.");
    });
  });

  describe("revokeInviteProcedure", () => {
    function createInviteRouterForTest(appUrl?: string) {
      const db = mockDb();
      const trpc = mockTrpc();
      const router = createInviteRouter(db, trpc, appUrl);
      return { db, trpc, router };
    }

    it("deletes pending invitation", async () => {
      const { db, router } = createInviteRouterForTest();
      const { revokeInvite: revokeProcedure } = router as any;
      (db as any).userInvitation.findUnique.mockResolvedValue({ id: "inv1" });
      (db as any).userInvitation.delete.mockResolvedValue({});

      const result = await revokeProcedure({ input: { email: "x@e.com" } });
      expect(result).toEqual({ ok: true });
      expect((db as any).userInvitation.delete).toHaveBeenCalledWith({ where: { email: "x@e.com" } });
    });

    it("throws NOT_FOUND when no pending invitation", async () => {
      const { db, router } = createInviteRouterForTest();
      const { revokeInvite: revokeProcedure } = router as any;
      (db as any).userInvitation.findUnique.mockResolvedValue(null);

      await expect(
        revokeProcedure({ input: { email: "x@e.com" } }),
      ).rejects.toThrow("No pending invitation found for this email.");
    });
  });

  describe("sendInviteEmailProcedure", () => {
    function createInviteRouterForTest(appUrl?: string, options?: { sendInvitationEmail?: (args: { email: string; inviteUrl: string }) => Promise<void> }) {
      const db = mockDb();
      const trpc = mockTrpc();
      const router = createInviteRouter(db, trpc, appUrl, options);
      return { db, trpc, router };
    }

    it("throws PRECONDITION_FAILED when email not configured", async () => {
      const { router } = createInviteRouterForTest();
      const { sendInviteEmail: sendProcedure } = router as any;

      await expect(
        sendProcedure({ input: { email: "x@e.com", inviteUrl: "http://localhost/auth/accept-invite?token=abc" } }),
      ).rejects.toThrow("Email delivery is not configured.");
    });

    it("sends email when configured", async () => {
      const sendEmail = vi.fn().mockResolvedValue({});
      const { db, router } = createInviteRouterForTest("http://localhost:3001", {
        sendInvitationEmail: sendEmail,
      });
      const { sendInviteEmail: sendProcedure } = router as any;
      const { sha256: sha } = await import("../../../server/utils");
      const rawToken = "rawtoken";
      const hashedToken = sha(rawToken);
      (db as any).userInvitation.findUnique.mockResolvedValue({
        token: hashedToken,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await sendProcedure({
        input: { email: "x@e.com", inviteUrl: `http://localhost/auth/accept-invite?token=${rawToken}` },
      });
      expect(result).toEqual({ ok: true });
      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
