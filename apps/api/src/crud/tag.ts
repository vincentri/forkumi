import { defineCRUD } from "@repo/crud";

export const TagCRUD = defineCRUD({
  model: "tag",
  label: "Tag",
  navGroup: "Blog",
  icon: "Hash",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
      unique: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      slugFrom: "name",
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "inactive",
      options: [
        { label: "Inactive", value: "inactive" },
        { label: "Active", value: "active" },
      ],
    },
    { name: "metaTitle", type: "text", label: "Meta title", tab: "SEO", showInTable: false },
    { name: "metaDescription", type: "textarea", label: "Meta description", tab: "SEO", showInTable: false },
    { name: "metaKeywords", type: "text", label: "Meta keywords", tab: "SEO", showInTable: false },
  ],
});
