import { describe, it, expect, vi } from "vitest";
import { createGetPublicSettings } from "../../server/layout-helpers";

describe("createGetPublicSettings", () => {
  function mockPrisma(rows: { key: string; value: string | null }[] = []) {
    return {
      settings: {
        findMany: vi.fn().mockResolvedValue(rows),
      },
    };
  }

  it("returns key→value map from settings rows", async () => {
    const prisma = mockPrisma([
      { key: "appName", value: "Quantyx" },
      { key: "logoUrl", value: "/defaults/logo.png" },
    ]);
    const getter = createGetPublicSettings(prisma, ["appName", "logoUrl"]);
    const result = await getter();
    expect(result).toEqual({ appName: "Quantyx", logoUrl: "/defaults/logo.png" });
  });

  it("converts null values to null in result", async () => {
    const prisma = mockPrisma([{ key: "k", value: null }]);
    const getter = createGetPublicSettings(prisma, ["k"]);
    const result = await getter();
    expect(result.k).toBeNull();
  });

  it("queries with namespace filter when provided", async () => {
    const prisma = mockPrisma([]);
    const getter = createGetPublicSettings(prisma, [], { namespace: "branding" });
    await getter();
    expect(prisma.settings.findMany).toHaveBeenCalledWith({
      where: { namespace: "branding" },
      select: { key: true, value: true },
    });
  });

  it("queries with key.in filter when no namespace", async () => {
    const prisma = mockPrisma([]);
    const getter = createGetPublicSettings(prisma, ["a", "b"]);
    await getter();
    expect(prisma.settings.findMany).toHaveBeenCalledWith({
      where: { key: { in: ["a", "b"] } },
      select: { key: true, value: true },
    });
  });

  it("returns {} on error", async () => {
    const prisma = {
      settings: {
        findMany: vi.fn().mockRejectedValue(new Error("DB down")),
      },
    };
    const getter = createGetPublicSettings(prisma, ["a"]);
    const result = await getter();
    expect(result).toEqual({});
  });
});
