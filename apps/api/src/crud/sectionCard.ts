import { defineCRUD } from "@repo/crud";

const SECTION_OPTIONS = [
  { label: "Yang Kamu Dapat (Included)", value: "included" },
  { label: "Syarat (Terms)", value: "terms" },
  { label: "Pembayaran (Payment)", value: "payment" },
  { label: "Jaminan (Trust)", value: "trust" },
];

const COLOR_OPTIONS = [
  { label: "Purple", value: "purple" },
  { label: "Rose", value: "rose" },
  { label: "Gold", value: "gold" },
];

const ICON_OPTIONS = [
  { label: "Lightning bolt", value: "bolt" },
  { label: "Star", value: "star" },
  { label: "Lock", value: "lock" },
  { label: "File", value: "file" },
  { label: "Brand", value: "brand" },
  { label: "Graphic", value: "graphic" },
  { label: "UI/UX", value: "uiux" },
  { label: "Social", value: "social" },
  { label: "Motion", value: "motion" },
  { label: "Video", value: "video" },
  { label: "Illustration", value: "illus" },
  { label: "Web", value: "web" },
  { label: "Team", value: "team" },
  { label: "Eye", value: "eye" },
  { label: "Clock", value: "clock" },
  { label: "Data", value: "data" },
  { label: "Chat", value: "chat" },
  { label: "Mail", value: "mail" },
  { label: "Phone", value: "phone" },
  { label: "Instagram", value: "insta" },
];

export const SectionCardCRUD = defineCRUD({
  model: "sectionCard",
  label: "Section Cards",
  navGroup: "Front Page",
  icon: "Layers",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "section",
      type: "select",
      label: "Section",
      required: true,
      options: SECTION_OPTIONS,
    },
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
      name: "color",
      type: "select",
      label: "Color (only used for 'included')",
      default: "purple",
      options: COLOR_OPTIONS,
    },
    {
      name: "icon",
      type: "select",
      label: "Icon (only used for 'included')",
      default: "bolt",
      options: ICON_OPTIONS,
      note: "Inline SVG icon rendered inside the colored tile on /packages.",
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
