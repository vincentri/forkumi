import { describe, it, expect, vi } from "vitest";

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

vi.mock("@repo/db", () => ({
  prisma: {},
}));

vi.mock("@repo/admin/server", () => ({
  createGetPublicSettings: vi.fn(() => vi.fn().mockResolvedValue({ site_name: "Test" })),
}));

import { getPublicSettings } from "./getPublicSettings";

describe("getPublicSettings", () => {
  it("is a function (cached)", () => {
    expect(typeof getPublicSettings).toBe("function");
  });
});
