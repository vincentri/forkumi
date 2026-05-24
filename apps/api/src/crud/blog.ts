import { defineCRUD } from "@repo/crud";

export const BlogCRUD = defineCRUD({
  model: "blog",
  label: "Blogs",
  icon: "Book",
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
    { name: "description", type: "text", label: "Description", required: true },
    { name: "content", type: "richtext", label: "Content", required: true },
    { name: "image", type: "image", label: "Image", showInTable: false },
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
