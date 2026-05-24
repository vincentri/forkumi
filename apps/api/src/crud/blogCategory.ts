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
});
