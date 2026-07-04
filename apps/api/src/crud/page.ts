import { defineCRUD } from "@repo/crud";

export const PageCRUD = defineCRUD({
  model: "page",
  label: "Pages",
  navGroup: "Front Page",
  icon: "StickyNote",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title",
      unique: true,
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      unique: true,
      slugFrom: "title",
      required: true,
    },
    { name: "content", type: "richtext", label: "Content", required: true },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ],
});
