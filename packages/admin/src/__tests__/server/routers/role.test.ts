import { describe, it, expect, vi } from "vitest";
import { createRoleRouter } from "../../../server/routers/role";
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
    router: vi.fn((procs) => procs),
    permissionProcedure: handler,
  };
}

describe("createRoleRouter", () => {
  describe("roleCreateProcedure", () => {
    it("creates a role when caller is protected", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: true } } };
      const input = { name: "editor", permissions: ["user:view"] };
      (db as any).role.create.mockResolvedValue({ id: "r1", name: "editor" });

      const result = await roleRouter.create({ ctx, input });
      expect((db as any).role.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual({ id: "r1", name: "editor" });
    });

    it("throws FORBIDDEN when non-protected caller creates protected role", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      const input = { name: "admin", permissions: [], protected: true };

      await expect(roleRouter.create({ ctx, input })).rejects.toThrow("Cannot create a protected role.");
    });
  });

  describe("roleUpdateProcedure", () => {
    it("updates a non-protected role", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: false });
      (db as any).role.update.mockResolvedValue({ id: "r1", name: "updated" });

      const result = await roleRouter.update({
        ctx,
        input: { id: "r1", data: { name: "updated" } },
      });
      expect(result).toEqual({ id: "r1", name: "updated" });
    });

    it("throws FORBIDDEN when non-protected caller modifies protected role", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: true });

      await expect(
        roleRouter.update({ ctx, input: { id: "r1", data: { name: "x" } } }),
      ).rejects.toThrow("Cannot modify a protected role.");
    });

    it("throws FORBIDDEN when non-protected caller sets protected=true", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: false });

      await expect(
        roleRouter.update({ ctx, input: { id: "r1", data: { protected: true } } }),
      ).rejects.toThrow("Cannot set a role as protected.");
    });
  });

  describe("roleDeleteProcedure", () => {
    it("deletes an unprotected role with no users", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).user.count.mockResolvedValue(0);
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: false });
      (db as any).role.delete.mockResolvedValue({ id: "r1" });

      const result = await roleRouter.delete({ ctx, input: { id: "r1" } });
      expect(result).toEqual({ id: "r1" });
    });

    it("throws FORBIDDEN when deleting protected role as non-protected caller", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).user.count.mockResolvedValue(0);
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: true });

      await expect(
        roleRouter.delete({ ctx, input: { id: "r1" } }),
      ).rejects.toThrow("Cannot delete a protected role.");
    });

    it("throws BAD_REQUEST when role has assigned users", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).user.count.mockResolvedValue(3);
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: false });

      await expect(
        roleRouter.delete({ ctx, input: { id: "r1" } }),
      ).rejects.toThrow("Cannot delete role — 3 users assigned.");
    });

    it("uses singular 'user' when count is 1", async () => {
      const db = mockDb();
      const trpc = mockTrpc();
      const roleRouter = createRoleRouter(db, trpc);
      const ctx = { session: { user: { isProtectedRole: false } } };
      (db as any).user.count.mockResolvedValue(1);
      (db as any).role.findUnique.mockResolvedValue({ id: "r1", protected: false });

      await expect(
        roleRouter.delete({ ctx, input: { id: "r1" } }),
      ).rejects.toThrow("Cannot delete role — 1 user assigned.");
    });
  });
});
