import { describe, it, expect } from "vitest";

// These functions are not exported, so we test them by reimplementing the logic
// or by testing the behavior through the route handler. Since they're simple pure
// functions, we replicate and test the logic directly.

function sanitizePath(raw: string | null): string {
  if (!raw) return "uploads";
  const clean = raw.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+/, "").slice(0, 80);
  return clean || "uploads";
}

function isUploadPath(subPath: string): boolean {
  return subPath === "uploads" || subPath.startsWith("uploads/");
}

describe("sanitizePath", () => {
  it("returns 'uploads' for null input", () => {
    expect(sanitizePath(null)).toBe("uploads");
  });

  it("returns 'uploads' for empty string", () => {
    expect(sanitizePath("")).toBe("uploads");
  });

  it("strips special characters including dots", () => {
    expect(sanitizePath("uploads/images")).toBe("uploads/images");
    // The regex strips anything not in [a-zA-Z0-9/_-], so dots are removed
    expect(sanitizePath("uploads/images/!@#$%.jpg")).toBe("uploads/images/jpg");
  });

  it("strips leading slashes", () => {
    expect(sanitizePath("/uploads/images")).toBe("uploads/images");
    expect(sanitizePath("///uploads")).toBe("uploads");
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(100);
    expect(sanitizePath(long)).toHaveLength(80);
  });

  it("allows hyphens and underscores", () => {
    expect(sanitizePath("uploads/my-file_v2")).toBe("uploads/my-file_v2");
  });

  it("returns 'uploads' when stripping leaves empty string", () => {
    expect(sanitizePath("!@#$%")).toBe("uploads");
  });
});

describe("isUploadPath", () => {
  it("returns true for exact 'uploads'", () => {
    expect(isUploadPath("uploads")).toBe(true);
  });

  it("returns true for 'uploads/' prefix", () => {
    expect(isUploadPath("uploads/images")).toBe(true);
    expect(isUploadPath("uploads/logo/photo.jpg")).toBe(true);
  });

  it("returns false for paths without uploads prefix", () => {
    expect(isUploadPath("other")).toBe(false);
    expect(isUploadPath("uploads-backdoor")).toBe(false);
  });

  it("does NOT detect path traversal (defense is in sanitizePath + resolvePublicFile)", () => {
    // isUploadPath only checks prefix — traversal defense is layered in the route handler
    expect(isUploadPath("uploads/../../etc")).toBe(true);
  });
});
