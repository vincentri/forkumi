import { defineCRUD } from "@repo/crud";

export const PlanFeatureCRUD = defineCRUD({
  model: "planFeature",
  label: "Plan Features",
  navGroup: "Front Page",
  icon: "ListOrdered",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "planId",
      type: "select",
      label: "Plan",
      required: true,
      optionsFrom: {
        model: "plan",
        valueField: "id",
        labelField: "name",
        orderBy: { position: "asc" },
      },
    },
    {
      name: "text",
      type: "text",
      label: "Feature Text",
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