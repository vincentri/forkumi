import { defineCRUD } from "@repo/crud";

export const MarqueeItemCRUD = defineCRUD({
  model: "marqueeItem",
  label: "Marquee",
  navGroup: "Front Page",
  icon: "Megaphone",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "text",
      type: "text",
      label: "Text",
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