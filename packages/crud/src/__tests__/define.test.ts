import { describe, expect, it } from "vitest";
import { defineCRUD } from "../define";
import type { CRUDFieldRange } from "../types";

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
    const field = config.fields[0]! as CRUDFieldRange;
    expect(field.min).toBe(0);
    expect(field.max).toBe(100);
    expect(field.step).toBe(1);
  });

  it("respects explicit range overrides", () => {
    const config = defineCRUD({
      model: "post",
      label: "Posts",
      fields: [{ name: "score", type: "range", label: "Score", min: 1, max: 10, step: 0.5 }],
    });
    const field = config.fields[0]! as CRUDFieldRange;
    expect(field.min).toBe(1);
    expect(field.max).toBe(10);
    expect(field.step).toBe(0.5);
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
