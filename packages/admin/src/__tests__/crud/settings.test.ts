import { describe, it, expect } from "vitest";
import { SettingsCRUD } from "../../crud/settings";

describe("SettingsCRUD", () => {
  it("has correct model and label", () => {
    expect(SettingsCRUD.model).toBe("settings");
    expect(SettingsCRUD.label).toBe("Settings");
  });

  it("uses keyValue mode", () => {
    expect(SettingsCRUD.mode).toBe("keyValue");
  });

  it("has 10 fields", () => {
    expect(SettingsCRUD.fields).toHaveLength(10);
  });

  it("all fields have tab and namespace", () => {
    for (const field of SettingsCRUD.fields) {
      expect(field.tab).toBeDefined();
      expect((field as any).namespace).toBeDefined();
    }
  });

  it("branding fields are in Branding tab", () => {
    const brandingFields = SettingsCRUD.fields.filter((f) => (f as any).namespace === "branding");
    expect(brandingFields.length).toBeGreaterThan(0);
    for (const field of brandingFields) {
      expect(field.tab).toBe("Branding");
    }
  });

  it("email fields are in Email tab", () => {
    const emailFields = SettingsCRUD.fields.filter((f) => (f as any).namespace === "email");
    expect(emailFields.length).toBeGreaterThan(0);
    for (const field of emailFields) {
      expect(field.tab).toBe("Email");
    }
  });

  it("email fields have visibleWhen condition on emailEnabled", () => {
    const emailFields = SettingsCRUD.fields.filter((f) => (f as any).namespace === "email" && f.name !== "emailEnabled");
    for (const field of emailFields) {
      expect(field.visibleWhen).toEqual({ field: "emailEnabled", equals: true });
    }
  });

  it("emailEnabled field has no visibleWhen", () => {
    const field = SettingsCRUD.fields.find((f) => f.name === "emailEnabled");
    expect(field).toBeDefined();
    expect(field!.visibleWhen).toBeUndefined();
  });

  it("emailEnabled defaults to false", () => {
    const field = SettingsCRUD.fields.find((f) => f.name === "emailEnabled");
    expect(field!.default).toBe(false);
  });

});
