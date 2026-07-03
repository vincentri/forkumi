import { describe, it, expect } from "vitest";
import { UserCRUD } from "../../crud/user";

describe("UserCRUD", () => {
  it("has correct model and label", () => {
    expect(UserCRUD.model).toBe("user");
    expect(UserCRUD.label).toBe("Users");
  });

  it("has correct icon and nav group", () => {
    expect(UserCRUD.icon).toBe("Users");
    expect(UserCRUD.navGroup).toBe("Administration");
  });

  it("has 6 fields", () => {
    expect(UserCRUD.fields).toHaveLength(6);
  });

  it("name field is required text", () => {
    const field = UserCRUD.fields.find((f) => f.name === "name");
    expect(field).toBeDefined();
    expect(field!.type).toBe("text");
    expect(field!.required).toBe(true);
  });

  it("email field is required email type", () => {
    const field = UserCRUD.fields.find((f) => f.name === "email");
    expect(field).toBeDefined();
    expect(field!.type).toBe("email");
    expect(field!.required).toBe(true);
  });

  it("password field is hidden from table", () => {
    const field = UserCRUD.fields.find((f) => f.name === "password");
    expect(field).toBeDefined();
    expect(field!.type).toBe("password");
    expect(field!.showInTable).toBe(false);
  });

  it("roleId field is hidden from table", () => {
    const field = UserCRUD.fields.find((f) => f.name === "roleId");
    expect(field).toBeDefined();
    expect(field!.type).toBe("select");
    expect(field!.showInTable).toBe(false);
  });

  it("roleName field is hidden from form", () => {
    const field = UserCRUD.fields.find((f) => f.name === "roleName");
    expect(field).toBeDefined();
    expect(field!.showInForm).toBe(false);
  });

  it("createdAt field is hidden from form", () => {
    const field = UserCRUD.fields.find((f) => f.name === "createdAt");
    expect(field).toBeDefined();
    expect(field!.showInForm).toBe(false);
  });
});
