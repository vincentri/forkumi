import { describe, expect, it } from "vitest";
import { buildUpdateZodSchema, buildZodSchema } from "../schema-builder";
import type { CRUDConfig } from "../types";

function makeConfig(fields: CRUDConfig["fields"]): CRUDConfig {
  return { model: "test", label: "Test", fields };
}

describe("buildZodSchema", () => {
  describe("text field", () => {
    it("required: accepts non-empty string", () => {
      const schema = buildZodSchema(makeConfig([{ name: "title", type: "text", label: "Title", required: true }]));
      expect(schema.parse({ title: "hello" })).toEqual({ title: "hello" });
    });

    it("required: rejects empty string", () => {
      const schema = buildZodSchema(makeConfig([{ name: "title", type: "text", label: "Title", required: true }]));
      expect(() => schema.parse({ title: "" })).toThrow();
    });

    it("optional: empty string → undefined", () => {
      const schema = buildZodSchema(makeConfig([{ name: "title", type: "text", label: "Title" }]));
      const result = schema.parse({ title: "" });
      expect(result.title).toBeUndefined();
    });
  });

  describe("number field", () => {
    it("required: coerces string to number", () => {
      const schema = buildZodSchema(makeConfig([{ name: "price", type: "number", label: "Price", required: true }]));
      expect(schema.parse({ price: "42" })).toEqual({ price: 42 });
    });

    it("required: accepts number", () => {
      const schema = buildZodSchema(makeConfig([{ name: "price", type: "number", label: "Price", required: true }]));
      expect(schema.parse({ price: 9.99 })).toEqual({ price: 9.99 });
    });
  });

  describe("boolean field", () => {
    it("required: accepts true/false", () => {
      const schema = buildZodSchema(makeConfig([{ name: "published", type: "boolean", label: "Published", required: true }]));
      expect(schema.parse({ published: true })).toEqual({ published: true });
      expect(schema.parse({ published: false })).toEqual({ published: false });
    });

    it("optional: can be omitted", () => {
      const schema = buildZodSchema(makeConfig([{ name: "published", type: "boolean", label: "Published" }]));
      expect(schema.parse({})).toEqual({ published: undefined });
    });
  });

  describe("email field", () => {
    it("required: validates email format", () => {
      const schema = buildZodSchema(makeConfig([{ name: "email", type: "email", label: "Email", required: true }]));
      expect(schema.parse({ email: "user@example.com" })).toEqual({ email: "user@example.com" });
      expect(() => schema.parse({ email: "not-an-email" })).toThrow();
    });
  });

  describe("color field", () => {
    it("required: accepts valid hex", () => {
      const schema = buildZodSchema(makeConfig([{ name: "color", type: "color", label: "Color", required: true }]));
      expect(schema.parse({ color: "#ff0000" })).toEqual({ color: "#ff0000" });
      expect(schema.parse({ color: "#AABBCC" })).toEqual({ color: "#AABBCC" });
    });

    it("required: rejects invalid hex", () => {
      const schema = buildZodSchema(makeConfig([{ name: "color", type: "color", label: "Color", required: true }]));
      expect(() => schema.parse({ color: "red" })).toThrow();
      expect(() => schema.parse({ color: "#gg0000" })).toThrow();
      expect(() => schema.parse({ color: "#ff000" })).toThrow(); // 5 chars
    });

    it("optional: empty string → undefined (browser clears color picker)", () => {
      const schema = buildZodSchema(makeConfig([{ name: "color", type: "color", label: "Color" }]));
      const result = schema.parse({ color: "" });
      expect(result.color).toBeUndefined();
    });
  });

  describe("range field", () => {
    it("coerces string to number", () => {
      const schema = buildZodSchema(makeConfig([{ name: "score", type: "range", label: "Score", required: true, min: 0, max: 100 }]));
      expect(schema.parse({ score: "50" })).toEqual({ score: 50 });
    });

    it("enforces min/max", () => {
      const schema = buildZodSchema(makeConfig([{ name: "score", type: "range", label: "Score", required: true, min: 1, max: 10 }]));
      expect(() => schema.parse({ score: 0 })).toThrow();
      expect(() => schema.parse({ score: 11 })).toThrow();
      expect(schema.parse({ score: 5 })).toEqual({ score: 5 });
    });
  });

  describe("select field", () => {
    it("required: accepts enum value", () => {
      const schema = buildZodSchema(makeConfig([{
        name: "status", type: "select", label: "Status", required: true,
        options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }],
      }]));
      expect(schema.parse({ status: "draft" })).toEqual({ status: "draft" });
      expect(() => schema.parse({ status: "unknown" })).toThrow();
    });

    it("optional: null from DB → undefined (user with no role assigned)", () => {
      // Regression: ISSUE-004 — Edit form shows 'Invalid literal value, expected ""' when
      // an optional select field (e.g. roleId) is null in the DB. null must coerce to undefined.
      // Found by /qa on 2026-04-25
      const schema = buildZodSchema(makeConfig([{
        name: "roleId", type: "select", label: "Role",
        options: [{ label: "Admin", value: "role_1" }],
      }]));
      const result = schema.parse({ roleId: null });
      expect(result.roleId).toBeUndefined();
    });
  });

  describe("showInForm: false fields", () => {
    // Regression: ISSUE-001 — Edit form silently fails when DB row has null for a
    // display-only field (e.g. roleName: null). The Zod schema must skip showInForm:false
    // fields so null/unexpected values in the row don't block form submission.
    // Found by /qa on 2026-04-24
    // Report: .gstack/qa-reports/qa-report-localhost-3001-2026-04-24.md
    it("skips showInForm:false fields in validation — null display value must not block submit", () => {
      const schema = buildZodSchema(makeConfig([
        { name: "name", type: "text", label: "Name", required: true },
        { name: "roleName", type: "text", label: "Role", showInForm: false },
        { name: "createdAt", type: "date", label: "Created", showInForm: false },
      ]));
      // Row from DB: roleName is null, createdAt is a formatted string — both should pass through
      const result = schema.parse({ name: "Test User", roleName: null, createdAt: "Apr 24, 2026, 2:40 PM" });
      expect(result.name).toBe("Test User");
    });

    it("passes through display-only field values unchanged via passthrough", () => {
      const schema = buildZodSchema(makeConfig([
        { name: "name", type: "text", label: "Name", required: true },
        { name: "id", type: "text", label: "ID", showInForm: false },
      ]));
      const result = schema.parse({ name: "Admin", id: "cma123abc" });
      expect((result as Record<string, unknown>).id).toBe("cma123abc");
    });
  });
});

describe("buildUpdateZodSchema", () => {
  it("all fields become optional — empty object passes", () => {
    const schema = buildUpdateZodSchema(makeConfig([
      { name: "title", type: "text", label: "Title", required: true },
      { name: "price", type: "number", label: "Price", required: true },
    ]));
    expect(schema.parse({})).toEqual({});
  });

  it("individual fields still validate when provided", () => {
    const schema = buildUpdateZodSchema(makeConfig([
      { name: "email", type: "email", label: "Email", required: true },
    ]));
    expect(schema.parse({ email: "user@example.com" })).toEqual({ email: "user@example.com" });
    expect(() => schema.parse({ email: "not-an-email" })).toThrow();
  });

  it("boolean fields validate when provided", () => {
    const schema = buildUpdateZodSchema(makeConfig([
      { name: "published", type: "boolean", label: "Published", required: true },
    ]));
    expect(schema.parse({ published: true })).toEqual({ published: true });
    expect(schema.parse({})).toEqual({});
  });

  it("select fields validate enum when provided", () => {
    const schema = buildUpdateZodSchema(makeConfig([{
      name: "status", type: "select", label: "Status", required: true,
      options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }],
    }]));
    expect(schema.parse({ status: "draft" })).toEqual({ status: "draft" });
    expect(() => schema.parse({ status: "unknown" })).toThrow();
    expect(schema.parse({})).toEqual({});
  });

  it("passthrough allows unknown fields", () => {
    const schema = buildUpdateZodSchema(makeConfig([
      { name: "title", type: "text", label: "Title" },
    ]));
    const result = schema.parse({ title: "hello", extra: "data" });
    expect(result.title).toBe("hello");
    expect((result as Record<string, unknown>).extra).toBe("data");
  });
});
