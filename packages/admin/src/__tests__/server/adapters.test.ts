import { describe, it, expect, vi } from "vitest";
import { createPrismaAdapter } from "../../server/adapters";

function mockPrisma() {
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
    $transaction: vi.fn().mockResolvedValue([]),
  };
}

describe("createPrismaAdapter", () => {
  it("delegates user.findMany", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const args = { where: { name: "test" } };
    prisma.user.findMany.mockResolvedValue([{ id: "1" }]);
    const result = await adapter.user.findMany(args);
    expect(prisma.user.findMany).toHaveBeenCalledWith(args);
    expect(result).toEqual([{ id: "1" }]);
  });

  it("delegates user.findUnique", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const args = { where: { id: "1" } };
    prisma.user.findUnique.mockResolvedValue({ id: "1" });
    const result = await adapter.user.findUnique(args);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(args);
    expect(result).toEqual({ id: "1" });
  });

  it("delegates user.create", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const args = { data: { name: "test" } };
    await adapter.user.create(args);
    expect(prisma.user.create).toHaveBeenCalledWith(args);
  });

  it("delegates user.update", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const args = { where: { id: "1" }, data: { name: "updated" } };
    await adapter.user.update(args);
    expect(prisma.user.update).toHaveBeenCalledWith(args);
  });

  it("delegates user.delete", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const args = { where: { id: "1" } };
    await adapter.user.delete(args);
    expect(prisma.user.delete).toHaveBeenCalledWith(args);
  });

  it("delegates user.count", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    prisma.user.count.mockResolvedValue(5);
    const result = await adapter.user.count({ where: {} });
    expect(prisma.user.count).toHaveBeenCalled();
    expect(result).toBe(5);
  });

  it("delegates role.findMany", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.role.findMany({});
    expect(prisma.role.findMany).toHaveBeenCalled();
  });

  it("delegates role.create", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.role.create({ data: { name: "admin" } });
    expect(prisma.role.create).toHaveBeenCalled();
  });

  it("delegates role.update", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.role.update({ where: { id: "1" }, data: {} });
    expect(prisma.role.update).toHaveBeenCalled();
  });

  it("delegates role.delete", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.role.delete({ where: { id: "1" } });
    expect(prisma.role.delete).toHaveBeenCalled();
  });

  it("delegates userInvitation.findMany", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.userInvitation.findMany({});
    expect(prisma.userInvitation.findMany).toHaveBeenCalled();
  });

  it("delegates userInvitation.create", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.userInvitation.create({ data: {} });
    expect(prisma.userInvitation.create).toHaveBeenCalled();
  });

  it("delegates userInvitation.update", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.userInvitation.update({ where: { id: "1" }, data: {} });
    expect(prisma.userInvitation.update).toHaveBeenCalled();
  });

  it("delegates userInvitation.delete", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    await adapter.userInvitation.delete({ where: { id: "1" } });
    expect(prisma.userInvitation.delete).toHaveBeenCalled();
  });

  it("delegates $transaction", async () => {
    const prisma = mockPrisma();
    const adapter = createPrismaAdapter(prisma);
    const ops = [{}, {}];
    await adapter.$transaction!(ops);
    expect(prisma.$transaction).toHaveBeenCalledWith(ops);
  });
});
