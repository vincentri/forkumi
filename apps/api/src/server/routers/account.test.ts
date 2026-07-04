import { describe, it, expect } from "vitest";
import { z } from "zod";

// Replicate the Zod schemas from account.ts for isolated testing
const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

describe("updateProfile schema", () => {
  it("accepts valid name", () => {
    expect(updateProfileSchema.safeParse({ name: "John Doe" }).success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = updateProfileSchema.safeParse({ name: "  John  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("John");
  });

  it("rejects empty name", () => {
    const result = updateProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    const result = updateProfileSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 100 characters", () => {
    const result = updateProfileSchema.safeParse({ name: "a".repeat(100) });
    expect(result.success).toBe(true);
  });
});

describe("updatePassword schema", () => {
  it("accepts valid passwords", () => {
    expect(updatePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpassword123",
    }).success).toBe(true);
  });

  it("rejects empty current password", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpassword123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects new password under 8 characters", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts new password at exactly 8 characters", () => {
    const result = updatePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(updatePasswordSchema.safeParse({}).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ currentPassword: "x" }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ newPassword: "x" }).success).toBe(false);
  });
});
