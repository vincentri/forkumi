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
      name: "image",
      type: "image",
      label: "Icon Image",
      uploadUrl: "/api/upload?path=uploads/section-cards",
      note: "Shown inside the colored icon tile for 'included' cards on /packages. Square ~48×48px works best.",
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
