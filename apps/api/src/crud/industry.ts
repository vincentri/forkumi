import { defineCRUD } from "@repo/crud";

export const IndustryItemCRUD = defineCRUD({
  model: "industryItem",
  label: "Industries",
  navGroup: "Front Page",
  icon: "Building2",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
    {
      name: "tag",
      type: "text",
      label: "Tag (e.g. Branding · Logo · Web)",
      required: true,
    },
    {
      name: "locale",
      type: "select",
      label: "Locale",
      required: true,
      default: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Indonesian", value: "id" },
      ],
    },
    {
      name: "position",
      type: "number",
      label: "Position",
      default: 0,
    },
    {
      name: "active",
      type: "boolean",
      label: "Active",
      default: true,
    },
  ],
});
