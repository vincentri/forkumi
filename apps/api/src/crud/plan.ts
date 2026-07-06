import { defineCRUD } from "@repo/crud";

const COLOR_OPTIONS = [
  { label: "Purple", value: "purple" },
  { label: "Rose", value: "rose" },
  { label: "Gold", value: "gold" },
];

export const PlanCRUD = defineCRUD({
  model: "plan",
  label: "Plans",
  navGroup: "Front Page",
  icon: "Package",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Plan Name",
      required: true,
    },
    {
      name: "color",
      type: "select",
      label: "Color Theme",
      required: true,
      default: "purple",
      options: COLOR_OPTIONS,
    },
    {
      name: "price",
      type: "text",
      label: "Promo Price",
      required: true,
      note: "Display string, e.g. Rp 1.500k. Use the exact formatting you want shown.",
    },
    {
      name: "normalPrice",
      type: "text",
      label: "Normal Price (struck through)",
      required: true,
      note: "e.g. Rp 2.500k. Shown struck through next to the promo price.",
    },
    {
      name: "best",
      type: "boolean",
      label: "Best / Most Popular",
      default: false,
      note: "Marks this plan with the ★ Favorit / Popular star.",
    },
    {
      name: "ctaUrl",
      type: "text",
      label: "CTA URL (full)",
      note: "Full URL for the Pilih Paket button (e.g. https://wa.me/.../?text=...).",
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
      note: "Inactive plans are hidden from the public site.",
    },
  ],
});