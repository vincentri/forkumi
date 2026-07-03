import { describe, expect, it } from "vitest";
import { toClientCRUDConfig } from "../client-config";
import type { CRUDConfig } from "../types";

describe("toClientCRUDConfig", () => {
  it("strips query hook from config", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      query: {
        list: async () => ({ items: [], total: 0, page: 1, pageSize: 20 }),
      },
      fields: [{ name: "title", type: "text", label: "Title" }],
    };
    const result = toClientCRUDConfig(config);
    expect(result.query).toBeUndefined();
    expect(result.fields).toHaveLength(1);
  });

  it("strips optionsQuery from select fields and adds hasDynamicOptions", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "categoryId",
          type: "select",
          label: "Category",
          optionsQuery: async () => [{ value: "1", label: "Cat 1" }],
        },
      ],
    };
    const result = toClientCRUDConfig(config);
    const field = result.fields[0];
    expect(field.type).toBe("select");
    expect("optionsQuery" in field).toBe(false);
    expect("hasDynamicOptions" in field).toBe(true);
  });

  it("preserves select fields without optionsQuery", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "status",
          type: "select",
          label: "Status",
          options: [
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ],
        },
      ],
    };
    const result = toClientCRUDConfig(config);
    const field = result.fields[0] as { options?: { value: string; label: string }[] };
    expect(field.options).toEqual([
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ]);
  });

  it("preserves non-select fields unchanged", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        { name: "title", type: "text", label: "Title", required: true },
        { name: "price", type: "number", label: "Price" },
        { name: "published", type: "boolean", label: "Published" },
      ],
    };
    const result = toClientCRUDConfig(config);
    expect(result.fields).toHaveLength(3);
    expect(result.fields[0]).toEqual({ name: "title", type: "text", label: "Title", required: true });
  });

  it("preserves optionsFrom fields unchanged", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [
        {
          name: "categoryId",
          type: "select",
          label: "Category",
          optionsFrom: {
            model: "category",
            valueField: "id",
            labelField: "name",
          },
        },
      ],
    };
    const result = toClientCRUDConfig(config);
    const field = result.fields[0] as { optionsFrom?: unknown };
    expect(field.optionsFrom).toBeDefined();
  });

  it("handles config without query hook", () => {
    const config: CRUDConfig = {
      model: "product",
      label: "Products",
      fields: [{ name: "title", type: "text", label: "Title" }],
    };
    const result = toClientCRUDConfig(config);
    expect(result.model).toBe("product");
    expect(result.fields).toHaveLength(1);
  });
});
