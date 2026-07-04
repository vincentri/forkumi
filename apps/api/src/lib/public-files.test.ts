import { describe, it, expect, vi } from "vitest";
import { resolvePublicFile, contentTypeForPath } from "./public-files";

describe("contentTypeForPath", () => {
  it("returns image/jpeg for .jpg", () => {
    expect(contentTypeForPath("photo.jpg")).toBe("image/jpeg");
  });

  it("returns image/jpeg for .jpeg", () => {
    expect(contentTypeForPath("photo.jpeg")).toBe("image/jpeg");
  });

  it("returns image/png for .png", () => {
    expect(contentTypeForPath("icon.png")).toBe("image/png");
  });

  it("returns image/gif for .gif", () => {
    expect(contentTypeForPath("animation.gif")).toBe("image/gif");
  });

  it("returns image/webp for .webp", () => {
    expect(contentTypeForPath("modern.webp")).toBe("image/webp");
  });

  it("returns image/svg+xml for .svg", () => {
    expect(contentTypeForPath("vector.svg")).toBe("image/svg+xml");
  });

  it("returns application/octet-stream for unknown extensions", () => {
    expect(contentTypeForPath("data.bin")).toBe("application/octet-stream");
  });

  it("is case-insensitive", () => {
    expect(contentTypeForPath("PHOTO.JPG")).toBe("image/jpeg");
    expect(contentTypeForPath("Icon.PNG")).toBe("image/png");
  });
});

describe("resolvePublicFile", () => {
  it("joins subPath and segments into a valid path", () => {
    const result = resolvePublicFile("uploads", "image.png");
    expect(result).toContain("uploads");
    expect(result).toContain("image.png");
  });

  it("throws on path traversal with ..", () => {
    expect(() => resolvePublicFile("uploads", "../etc/passwd")).toThrow("Invalid path");
  });

  it("normalizes path but does not reject absolute subPath", () => {
    const result = resolvePublicFile("/etc/passwd");
    expect(typeof result).toBe("string");
  });

  it("throws when segment escapes the root", () => {
    expect(() => resolvePublicFile("uploads", "subdir", "../../etc/passwd")).toThrow("Invalid path");
  });

  it("allows nested paths within root", () => {
    const result = resolvePublicFile("uploads", "subdir", "file.jpg");
    expect(result).toContain("uploads");
    expect(result).toContain("subdir");
    expect(result).toContain("file.jpg");
  });
});
