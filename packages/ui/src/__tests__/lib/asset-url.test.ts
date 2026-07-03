import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveAssetUrl, isManagedAssetPath } from "../../lib/asset-url";

describe("resolveAssetUrl", () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it("returns null for null/undefined/empty", () => {
    expect(resolveAssetUrl(null)).toBeNull();
    expect(resolveAssetUrl(undefined)).toBeNull();
    expect(resolveAssetUrl("")).toBeNull();
  });

  it("passes through absolute URLs", () => {
    expect(resolveAssetUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
    expect(resolveAssetUrl("http://example.com/img.png")).toBe("http://example.com/img.png");
    expect(resolveAssetUrl("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(resolveAssetUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
  });

  it("returns value as-is if no leading slash", () => {
    expect(resolveAssetUrl("relative/path.png")).toBe("relative/path.png");
  });

  it("prepends API base for normal paths", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    expect(resolveAssetUrl("/images/logo.png")).toBe("http://localhost:3001/images/logo.png");
  });

  it("prepends storage base for /uploads/ paths", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL = "http://cdn.example.com";
    expect(resolveAssetUrl("/uploads/file.png")).toBe("http://cdn.example.com/uploads/file.png");
  });

  it("prepends storage base for /defaults/ paths", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL = "http://cdn.example.com";
    expect(resolveAssetUrl("/defaults/logo.png")).toBe("http://cdn.example.com/defaults/logo.png");
  });

  it("falls back to localhost when API base is not set", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
    expect(resolveAssetUrl("/uploads/file.png")).toBe("http://localhost:3001/uploads/file.png");
  });

  it("falls back to API base when storage base is not set", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
    delete process.env.NEXT_PUBLIC_STORAGE_BASE_URL;
    expect(resolveAssetUrl("/uploads/file.png")).toBe("http://localhost:3001/uploads/file.png");
  });

  it("strips trailing slash from base URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001/";
    expect(resolveAssetUrl("/images/logo.png")).toBe("http://localhost:3001/images/logo.png");
  });
});

describe("isManagedAssetPath", () => {
  it("returns true for /uploads/ paths", () => {
    expect(isManagedAssetPath("/uploads/file.png")).toBe(true);
  });

  it("returns true for /defaults/ paths", () => {
    expect(isManagedAssetPath("/defaults/logo.png")).toBe(true);
  });

  it("returns false for other paths", () => {
    expect(isManagedAssetPath("/images/logo.png")).toBe(false);
    expect(isManagedAssetPath("uploads/file.png")).toBe(false);
  });
});
