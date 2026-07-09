import { defineCRUD } from "@repo/crud";

const TINT_OPTIONS = [
  { label: "Purple", value: "purple" },
  { label: "Rose", value: "rose" },
  { label: "Blue", value: "blue" },
  { label: "Yellow", value: "yellow" },
];

export const ServiceCategoryCRUD = defineCRUD({
  model: "serviceCategory",
  label: "Service Categories",
  navGroup: "Front Page",
  icon: "LayoutGrid",
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
      name: "items",
      type: "textarea",
      label: "Items",
      required: true,
      note: "One item per line. They render as bullet points under the category.",
    },
    {
      name: "tint",
      type: "select",
      label: "Tint Color",
      default: "purple",
      options: TINT_OPTIONS,
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
