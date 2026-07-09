import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSettingsFindMany } = vi.hoisted(() => ({
  mockSettingsFindMany: vi.fn(),
}));

vi.mock("@repo/db", () => ({
  prisma: { settings: { findMany: mockSettingsFindMany } },
}));

vi.mock("./secret-crypto", () => ({
  isEncryptedSecret: (v: string | null | undefined) => typeof v === "string" && v.startsWith("encrypted:"),
  decryptSecret: (v: string) => `decrypted:${v}`,
}));

vi.mock("@repo/email/providers/resend", () => ({
  createResendProvider: vi.fn((config) => ({ send: vi.fn().mockResolvedValue({ id: "resend-id" }), config })),
}));

import { getEmailSettings, sendEmail } from "./email";

describe("getEmailSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when no settings exist", async () => {
    mockSettingsFindMany.mockResolvedValue([]);
    const settings = await getEmailSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.fromEmail).toBe("");
    expect(settings.fromName).toBe("");
    expect(settings.replyTo).toBe("");
    expect(settings.notifyTo).toBe("");
    expect(settings.resendApiKeyConfigured).toBe(false);
  });

  it("parses email settings from rows", async () => {
    mockSettingsFindMany.mockResolvedValue([
      { key: "emailEnabled", value: "true" },
      { key: "emailFromEmail", value: "hi@test.com" },
      { key: "emailFromName", value: "Test" },
      { key: "emailReplyTo", value: "reply@test.com" },
      { key: "emailNotifyTo", value: "ops@test.com" },
      { key: "emailResendApiKey", value: "encrypted:v1:xxx" },
    ]);
    const settings = await getEmailSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.fromEmail).toBe("hi@test.com");
    expect(settings.fromName).toBe("Test");
    expect(settings.replyTo).toBe("reply@test.com");
    expect(settings.notifyTo).toBe("ops@test.com");
    expect(settings.resendApiKeyConfigured).toBe(true);
  });
});

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when email is disabled", async () => {
    mockSettingsFindMany.mockResolvedValue([]);
    await expect(
      sendEmail({ to: "x@y.com", subject: "Hi", html: "<p>hi</p>", text: "hi" }),
    ).rejects.toThrow("Email delivery is disabled.");
  });

  it("throws when fromEmail is missing", async () => {
    mockSettingsFindMany.mockResolvedValue([{ key: "emailEnabled", value: "true" }]);
    await expect(
      sendEmail({ to: "x@y.com", subject: "Hi", html: "<p>hi</p>", text: "hi" }),
    ).rejects.toThrow("Email from address is required.");
  });

  it("throws when resend API key is not configured", async () => {
    mockSettingsFindMany.mockResolvedValue([
      { key: "emailEnabled", value: "true" },
      { key: "emailFromEmail", value: "hi@test.com" },
    ]);
    await expect(
      sendEmail({ to: "x@y.com", subject: "Hi", html: "<p>hi</p>", text: "hi" }),
    ).rejects.toThrow("Resend API key is not configured.");
  });

  it("sends via resend provider with valid config", async () => {
    mockSettingsFindMany.mockResolvedValue([
      { key: "emailEnabled", value: "true" },
      { key: "emailFromEmail", value: "hi@test.com" },
      { key: "emailFromName", value: "Test" },
      { key: "emailReplyTo", value: "reply@test.com" },
      { key: "emailResendApiKey", value: "encrypted:v1:xxx" },
    ]);
    const result = await sendEmail({ to: "x@y.com", subject: "Hi", html: "<p>hi</p>", text: "hi" });
    expect(result).toEqual({ id: "resend-id" });
  });
});
