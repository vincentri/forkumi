import { describe, it, expect } from "vitest";
import { createRoleCRUD } from "../../crud/role";

describe("createRoleCRUD", () => {
  const permOptions = [
    { value: "user:view", label: "Users — View" },
    { value: "user:create", label: "Users — Create" },
  ];

  it("returns a valid CRUD config", () => {
    const config = createRoleCRUD(permOptions);
    expect(config.model).toBe("role");
    expect(config.label).toBe("Roles");
    expect(config.icon).toBe("Shield");
    expect(config.navGroup).toBe("Administration");
  });

  it("has 4 fields", () => {
    const config = createRoleCRUD(permOptions);
    expect(config.fields).toHaveLength(4);
  });

  it("has name text field", () => {
    const config = createRoleCRUD(permOptions);
    const nameField = config.fields.find((f) => f.name === "name");
    expect(nameField).toBeDefined();
    expect(nameField!.type).toBe("text");
    expect(nameField!.required).toBe(true);
  });

  it("has permissions multicheck field with provided options", () => {
    const config = createRoleCRUD(permOptions);
    const permField = config.fields.find((f) => f.name === "permissions");
    expect(permField).toBeDefined();
    expect(permField!.type).toBe("multicheck");
    expect((permField as any).options).toEqual(permOptions);
  });

  it("has protected boolean field hidden from form", () => {
    const config = createRoleCRUD(permOptions);
    const protectedField = config.fields.find((f) => f.name === "protected");
    expect(protectedField).toBeDefined();
    expect(protectedField!.type).toBe("boolean");
    expect(protectedField!.showInForm).toBe(false);
  });

  it("has createdAt date field hidden from form", () => {
    const config = createRoleCRUD(permOptions);
    const dateField = config.fields.find((f) => f.name === "createdAt");
    expect(dateField).toBeDefined();
    expect(dateField!.type).toBe("date");
    expect(dateField!.showInForm).toBe(false);
  });
});
