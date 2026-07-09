import { defineCRUD } from "@repo/crud";

export const ProcessPhaseCRUD = defineCRUD({
  model: "processPhase",
  label: "Process Phases",
  navGroup: "Front Page",
  icon: "ListOrdered",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Title",
      required: true,
    },
    {
      name: "steps",
      type: "textarea",
      label: "Steps",
      required: true,
      note: "One step per line. They render as inline pills in this order.",
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
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
