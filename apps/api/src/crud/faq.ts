import { defineCRUD } from "@repo/crud";

export const FaqItemCRUD = defineCRUD({
  model: "faqItem",
  label: "FAQ",
  navGroup: "Front Page",
  icon: "HelpCircle",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "question",
      type: "text",
      label: "Question",
      required: true,
    },
    {
      name: "answer",
      type: "textarea",
      label: "Answer",
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
