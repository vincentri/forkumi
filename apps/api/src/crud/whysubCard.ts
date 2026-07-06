import { defineCRUD } from "@repo/crud";

const COLOR_OPTIONS = [
  { label: "Purple", value: "purple" },
  { label: "Rose", value: "rose" },
  { label: "Gold", value: "gold" },
];

const ICON_OPTIONS = [
  { label: "Team", value: "team" },
  { label: "Brand", value: "brand" },
  { label: "Bolt", value: "bolt" },
  { label: "Data", value: "data" },
  { label: "Star", value: "star" },
  { label: "Lock", value: "lock" },
  { label: "Chat", value: "chat" },
  { label: "File", value: "file" },
  { label: "Clock", value: "clock" },
  { label: "Web", value: "web" },
];

export const WhysubCardCRUD = defineCRUD({
  model: "whysubCard",
  label: "Why Subscribe Cards",
  navGroup: "Front Page",
  icon: "CreditCard",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "heading",
      type: "text",
      label: "Heading",
      required: true,
    },
    {
      name: "paragraph",
      type: "textarea",
      label: "Paragraph",
      required: true,
    },
    {
      name: "icon",
      type: "select",
      label: "Icon",
      required: true,
      default: "team",
      options: ICON_OPTIONS,
    },
    {
      name: "color",
      type: "select",
      label: "Color",
      required: true,
      default: "purple",
      options: COLOR_OPTIONS,
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