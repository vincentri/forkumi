import { describe, expect, it } from "vitest";
import { crudModelToSlug, isCRUDResourceSlug } from "../resource-url";

describe("crudModelToSlug", () => {
  it("converts PascalCase to kebab-case", () => {
    expect(crudModelToSlug("Product")).toBe("product");
  });

  it("converts multi-word PascalCase to kebab-case", () => {
    expect(crudModelToSlug("BlogPost")).toBe("blog-post");
  });

  it("converts camelCase to kebab-case", () => {
    expect(crudModelToSlug("userProfile")).toBe("user-profile");
  });

  it("preserves already-slugged names", () => {
    expect(crudModelToSlug("already-slugged")).toBe("already-slugged");
  });

  it("handles single word", () => {
    expect(crudModelToSlug("single")).toBe("single");
  });

  it("handles underscores as separators", () => {
    expect(crudModelToSlug("blog_post")).toBe("blog-post");
  });

  it("handles spaces as separators", () => {
    expect(crudModelToSlug("blog post")).toBe("blog-post");
  });

  it("handles ALLCAPS", () => {
    expect(crudModelToSlug("PRODUCT")).toBe("product");
  });

  it("handles mixed case with numbers", () => {
    expect(crudModelToSlug("MyModel2")).toBe("my-model2");
  });
});

describe("isCRUDResourceSlug", () => {
  it("matches raw model name", () => {
    expect(isCRUDResourceSlug("Product", "Product")).toBe(true);
  });

  it("matches kebab-case slug", () => {
    expect(isCRUDResourceSlug("Product", "product")).toBe(true);
  });

  it("matches multi-word PascalCase to kebab", () => {
    expect(isCRUDResourceSlug("BlogPost", "blog-post")).toBe(true);
  });

  it("matches multi-word raw name", () => {
    expect(isCRUDResourceSlug("BlogPost", "BlogPost")).toBe(true);
  });

  it("does not match non-matching slug", () => {
    expect(isCRUDResourceSlug("Product", "user")).toBe(false);
  });

  it("does not match partial kebab", () => {
    expect(isCRUDResourceSlug("BlogPost", "blogpost")).toBe(false);
  });
});
