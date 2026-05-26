import { defineCRUD } from "@repo/crud";

export const BlogCategoryCRUD = defineCRUD({
  model: "blogCategory",
  label: "Category",
  icon: "Tag",
  navGroup: "Blog",
  navGroupIcon: "Tag",
  fields: [
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      slugFrom: "title",
    },
    { name: "title", type: "text", label: "Title", required: true },
    { name: "metaTitle", type: "text", label: "Meta title", tab: "SEO", showInTable: false },
    { name: "metaDescription", type: "textarea", label: "Meta description", tab: "SEO", showInTable: false },
    { name: "metaKeywords", type: "text", label: "Meta keywords", tab: "SEO", showInTable: false },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
  formLayout: [
    {
      columns: [
        {
          weight: 3,
          rows: [
            ["title"],
            ["slug"],
            ["status"],
          ],
        },
        {
          weight: 2,
          rows: [
            ["metaTitle"],
            ["metaDescription"],
            ["metaKeywords"],
          ],
        },
      ],
    },
  ],
});
