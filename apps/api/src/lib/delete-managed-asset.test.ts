import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({});

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = mockSend;
  },
  DeleteObjectCommand: class {
    input: any;
    constructor(input: any) {
      this.input = input;
    }
  },
}));

import { deleteManagedAsset } from "./delete-managed-asset";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

describe("deleteManagedAsset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("does nothing for non-/uploads/ paths", async () => {
    await deleteManagedAsset("/images/photo.jpg");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("does nothing when STORAGE_PROVIDER is not s3", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "local");
    await deleteManagedAsset("/uploads/file.png");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("skips when AWS_REGION is missing", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("AWS_S3_BUCKET", "my-bucket");
    vi.stubEnv("AWS_REGION", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await deleteManagedAsset("/uploads/file.png");
    expect(mockSend).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("skips when AWS_S3_BUCKET is missing", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("AWS_S3_BUCKET", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await deleteManagedAsset("/uploads/file.png");
    expect(mockSend).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("sends DeleteObjectCommand with correct key", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("AWS_S3_BUCKET", "my-bucket");
    await deleteManagedAsset("/uploads/images/photo.png");
    expect(mockSend).toHaveBeenCalled();
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.Bucket).toBe("my-bucket");
    expect(cmd.input.Key).toBe("uploads/images/photo.png");
  });

  it("strips leading slashes from key", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("AWS_S3_BUCKET", "my-bucket");
    await deleteManagedAsset("/uploads/file.pdf");
    const cmd = mockSend.mock.calls[0][0];
    expect(cmd.input.Key).toBe("uploads/file.pdf");
  });

  it("does not throw when S3 send fails", async () => {
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("AWS_REGION", "us-east-1");
    vi.stubEnv("AWS_S3_BUCKET", "my-bucket");
    mockSend.mockRejectedValueOnce(new Error("S3 error"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await deleteManagedAsset("/uploads/file.png");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
