import { describe, expect, it } from "vitest";
import { defineCRUD } from "../define";

describe("defineCRUD", () => {
  it("applies default showInTable: true for non-password fields", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "title", type: "text", label: "Title" }],
    });
    expect(config.fields[0]!.showInTable).toBe(true);
  });

  it("defaults showInTable: false for password fields", () => {
    const config = defineCRUD({
      model: "user",
      label: "Users",
      fields: [{ name: "password", type: "password", label: "Password" }],
    });
    expect(config.fields[0]!.showInTable).toBe(false);
  });

  it("respects explicit showInTable override for password", () => {
    const config = defineCRUD({
      model: "user",
      label: "Users",
      fields: [{ name: "password", type: "password", label: "Password", showInTable: true }],
    });
    expect(config.fields[0]!.showInTable).toBe(true);
  });

  it("applies default sortable: true", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "title", type: "text", label: "Title" }],
    });
    expect(config.fields[0]!.sortable).toBe(true);
  });

  it("applies range defaults (min=0, max=100, step=1)", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "score", type: "range", label: "Score" }],
    });
    expect(config.fields[0]!.min).toBe(0);
    expect(config.fields[0]!.max).toBe(100);
    expect(config.fields[0]!.step).toBe(1);
  });

  it("respects explicit range overrides", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "score", type: "range", label: "Score", min: 1, max: 10, step: 0.5 }],
    });
    expect(config.fields[0]!.min).toBe(1);
    expect(config.fields[0]!.max).toBe(10);
    expect(config.fields[0]!.step).toBe(0.5);
  });

  it("defaults required: false", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "title", type: "text", label: "Title" }],
    });
    expect(config.fields[0]!.required).toBe(false);
  });
});
