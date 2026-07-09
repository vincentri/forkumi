import { describe, it, expect } from "vitest";
import { z } from "@repo/crud";

// Replicate the Zod schemas from emailSettings.ts for isolated testing
const settingsInput = z.object({
  enabled: z.boolean(),
  provider: z.enum(["resend", "ses"]),
  fromEmail: z.string().trim(),
  fromName: z.string().trim(),
  replyTo: z.string().trim(),
  notifyTo: z.string().trim().refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid notification email or leave blank.",
  ),
});

const resendApiKeyInput = z.object({
  apiKey: z.string().trim().min(1, "Resend API key is required."),
});

const testEmailInput = z.object({
  to: z.string().trim().email("Enter a valid test recipient email."),
});

describe("settingsInput schema", () => {
  it("accepts valid resend config", () => {
    const result = settingsInput.safeParse({
      enabled: true,
      provider: "resend",
      fromEmail: "noreply@example.com",
      fromName: "My App",
      replyTo: "support@example.com",
      notifyTo: "ops@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid ses config", () => {
    const result = settingsInput.safeParse({
      enabled: false,
      provider: "ses",
      fromEmail: "",
      fromName: "",
      replyTo: "",
      notifyTo: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid provider", () => {
    const result = settingsInput.safeParse({
      enabled: true,
      provider: "smtp",
      fromEmail: "test@example.com",
      fromName: "Test",
      replyTo: "",
      notifyTo: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean enabled", () => {
    const result = settingsInput.safeParse({
      enabled: "yes",
      provider: "resend",
      fromEmail: "",
      fromName: "",
      replyTo: "",
      notifyTo: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed notifyTo", () => {
    const result = settingsInput.safeParse({
      enabled: true,
      provider: "resend",
      fromEmail: "noreply@example.com",
      fromName: "My App",
      replyTo: "",
      notifyTo: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from string fields", () => {
    const result = settingsInput.safeParse({
      enabled: true,
      provider: "resend",
      fromEmail: "  test@example.com  ",
      fromName: "  App  ",
      replyTo: "  reply@example.com  ",
      notifyTo: "  ops@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fromEmail).toBe("test@example.com");
      expect(result.data.fromName).toBe("App");
      expect(result.data.replyTo).toBe("reply@example.com");
      expect(result.data.notifyTo).toBe("ops@example.com");
    }
  });
});

describe("resendApiKeyInput schema", () => {
  it("accepts valid API key", () => {
    expect(resendApiKeyInput.safeParse({ apiKey: "re_abc123" }).success).toBe(true);
  });

  it("rejects empty API key", () => {
    expect(resendApiKeyInput.safeParse({ apiKey: "" }).success).toBe(false);
  });

  it("rejects whitespace-only API key", () => {
    expect(resendApiKeyInput.safeParse({ apiKey: "   " }).success).toBe(false);
  });

  it("trims whitespace from API key", () => {
    const result = resendApiKeyInput.safeParse({ apiKey: "  re_abc123  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.apiKey).toBe("re_abc123");
  });
});

describe("testEmailInput schema", () => {
  it("accepts valid email", () => {
    expect(testEmailInput.safeParse({ to: "user@example.com" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(testEmailInput.safeParse({ to: "not-an-email" }).success).toBe(false);
  });

  it("rejects empty email", () => {
    expect(testEmailInput.safeParse({ to: "" }).success).toBe(false);
  });

  it("trims whitespace", () => {
    const result = testEmailInput.safeParse({ to: "  user@example.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.to).toBe("user@example.com");
  });
});
