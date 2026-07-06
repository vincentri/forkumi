import { defineCRUD } from "@repo/crud";

export const CompareCategoryCRUD = defineCRUD({
  model: "compareCategory",
  label: "Compare Categories",
  navGroup: "Front Page",
  icon: "Columns3",
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
  ],
});