import { defineCRUD } from "@repo/crud";

export const PlanOfInterestCRUD = defineCRUD({
  model: "planOfInterest",
  label: "Plan of Interest",
  navGroup: "Inbox",
  icon: "Package",
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
    {
      name: "active",
      type: "boolean",
      label: "Active",
      default: true,
    },
  ],
});
