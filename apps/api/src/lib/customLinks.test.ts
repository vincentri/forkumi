import { describe, it, expect } from "vitest";
import { customLinks } from "./customLinks";

describe("customLinks", () => {
  it("is an array", () => {
    expect(Array.isArray(customLinks)).toBe(true);
  });

  it("contains entries with label, href, icon, permissions", () => {
    customLinks.forEach((link) => {
      expect(typeof link.label).toBe("string");
      expect(typeof link.href).toBe("string");
      expect(typeof link.icon).toBe("string");
      expect(Array.isArray(link.permissions)).toBe(true);
    });
  });

  it("has example page entry", () => {
    const example = customLinks.find((l) => l.href === "/admin/example-custom-page");
    expect(example).toBeDefined();
    expect(example!.label).toBe("Example Page");
    expect(example!.permissions).toContain("example:view");
  });
});
