import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Record<string, string>;
    constructor(body?: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers ?? {};
    }
  }
  return { NextResponse: MockNextResponse };
});

vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

vi.mock("~/lib/public-files", () => ({
  resolvePublicFile: vi.fn(),
  contentTypeForPath: vi.fn().mockReturnValue("text/html"),
}));

import { servePublicFile } from "./serve-public-file";
import { readFile } from "fs/promises";
import { resolvePublicFile, contentTypeForPath } from "~/lib/public-files";

describe("servePublicFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when path resolution throws", async () => {
    vi.mocked(resolvePublicFile).mockImplementation(() => {
      throw new Error("Invalid path");
    });
    const response = await servePublicFile("uploads", ["..", "etc", "passwd"]);
    expect(response.status).toBe(403);
  });

  it("returns file content with correct headers", async () => {
    vi.mocked(resolvePublicFile).mockReturnValue("/public/uploads/image.png");
    vi.mocked(readFile).mockResolvedValue(Buffer.from("file-content") as never);
    vi.mocked(contentTypeForPath).mockReturnValue("image/png");
    const response = await servePublicFile("uploads", ["image.png"]);
    expect(response.status).toBe(200);
  });

  it("returns 404 for ENOENT errors", async () => {
    vi.mocked(resolvePublicFile).mockReturnValue("/public/uploads/missing.png");
    const enoentError = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    vi.mocked(readFile).mockRejectedValue(enoentError);
    const response = await servePublicFile("uploads", ["missing.png"]);
    expect(response.status).toBe(404);
  });

  it("rethrows non-ENOENT errors", async () => {
    vi.mocked(resolvePublicFile).mockReturnValue("/public/uploads/file.png");
    vi.mocked(readFile).mockRejectedValue(new Error("Permission denied"));
    await expect(servePublicFile("uploads", ["file.png"])).rejects.toThrow("Permission denied");
  });
});
