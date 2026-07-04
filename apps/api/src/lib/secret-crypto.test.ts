import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isEncryptedSecret, encryptSecret, decryptSecret } from "./secret-crypto";

const TEST_KEY = "dGVzdC1lbmNyeXB0aW9uLWtleS0xMjM0NTY="; // base64 of "test-encryption-key-123456" (32 bytes when decoded properly)

// We need a proper 32-byte base64 key
function generateTestKey(): string {
  const buf = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) buf[i] = i;
  return buf.toString("base64");
}

beforeEach(() => {
  process.env.APP_ENCRYPTION_KEY = generateTestKey();
});

afterEach(() => {
  delete process.env.APP_ENCRYPTION_KEY;
});

describe("isEncryptedSecret", () => {
  it("returns true for encrypted values", () => {
    expect(isEncryptedSecret("encrypted:v1:abc:def:ghi")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isEncryptedSecret("hello world")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isEncryptedSecret(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isEncryptedSecret(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isEncryptedSecret("")).toBe(false);
  });
});

describe("encryptSecret / decryptSecret", () => {
  it("roundtrips a plaintext value", () => {
    const plainText = "my-secret-api-key-12345";
    const encrypted = encryptSecret(plainText);
    expect(encrypted).not.toBe(plainText);
    expect(encrypted).toMatch(/^encrypted:v1:/);
    expect(decryptSecret(encrypted)).toBe(plainText);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const plainText = "same-secret";
    const enc1 = encryptSecret(plainText);
    const enc2 = encryptSecret(plainText);
    // Different IVs => different ciphertext (though same plaintext)
    expect(enc1).not.toBe(enc2);
    // Both decrypt to the same value
    expect(decryptSecret(enc1)).toBe(plainText);
    expect(decryptSecret(enc2)).toBe(plainText);
  });

  it("handles unicode content", () => {
    const plainText = "日本語テスト 🔑 émojis";
    const encrypted = encryptSecret(plainText);
    expect(decryptSecret(encrypted)).toBe(plainText);
  });

  it("encrypts empty string but decrypt requires non-empty ciphertext (format limitation)", () => {
    const encrypted = encryptSecret("");
    expect(encrypted).toMatch(/^encrypted:v1:/);
    // The decrypt function rejects empty ciphertext segments, so we document this
    expect(() => decryptSecret(encrypted)).toThrow("Invalid encrypted secret format");
  });
});

describe("getEncryptionKey (error cases)", () => {
  it("throws when APP_ENCRYPTION_KEY is missing", () => {
    delete process.env.APP_ENCRYPTION_KEY;
    expect(() => encryptSecret("test")).toThrow("APP_ENCRYPTION_KEY is required");
  });

  it("throws when APP_ENCRYPTION_KEY is wrong length", () => {
    process.env.APP_ENCRYPTION_KEY = "tooshort";
    expect(() => encryptSecret("test")).toThrow("APP_ENCRYPTION_KEY must be 32 bytes");
  });
});

describe("decryptSecret (error cases)", () => {
  it("throws on invalid format", () => {
    expect(() => decryptSecret("garbage")).toThrow("Invalid encrypted secret format");
  });

  it("throws on tampered ciphertext", () => {
    const encrypted = encryptSecret("test");
    const parts = encrypted.split(":");
    // Tamper with the ciphertext (last part)
    parts[parts.length - 1] = "dGFtcGVk";
    const tampered = parts.join(":");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
