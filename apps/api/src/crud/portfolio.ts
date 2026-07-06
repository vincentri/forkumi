import { defineCRUD } from "@repo/crud";

export const PortfolioCRUD = defineCRUD({
  model: "portfolio",
  label: "Portfolio",
  navGroup: "Front Page",
  icon: "Briefcase",
  defaultSortField: "position",
  defaultSortDir: "asc",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Brand Name",
      required: true,
    },
    {
      name: "sub",
      type: "text",
      label: "Tagline",
      required: true,
    },
    {
      name: "image",
      type: "image",
      label: "Image (photo or logo)",
      uploadUrl: "/api/upload?path=uploads/portfolio",
      note: "Upload a photo for the photo variant. Upload a logo and set Logo Background for the logo variant.",
    },
    {
      name: "logoBg",
      type: "text",
      label: "Logo Background (hex or CSS)",
      note: "Leave empty for photo variant. Set a color (e.g. #F6F0E1 or var(--cream2)) to render the logo variant.",
    },
    {
      name: "tags",
      type: "text",
      label: "Tags (comma-separated)",
      note: "e.g. Branding,Website,F&B",
    },
    {
      name: "url",
      type: "text",
      label: "Primary URL",
      note: "Shows the Visit Website button when set.",
    },
    {
      name: "igUrl",
      type: "text",
      label: "Instagram URL",
      note: "Shows the Instagram button on the /portfolio page when set.",
    },
    {
      name: "blurbId",
      type: "textarea",
      label: "Blurb (Indonesian)",
    },
    {
      name: "blurbEn",
      type: "textarea",
      label: "Blurb (English)",
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