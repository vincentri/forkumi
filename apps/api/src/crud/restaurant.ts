import { TRPCError } from "@trpc/server";
import { defineCRUD } from "@repo/crud";

export const RestaurantCRUD = defineCRUD({
  model: "restaurant",
  label: "Restaurants",
  navGroup: "Restaurant",
  navGroupIcon: "UtensilsCrossed",
  icon: "UtensilsCrossed",
  defaultSortField: "createdAt",
  defaultSortDir: "desc",
  fields: [
    { name: "name", type: "text", label: "Name", required: true },
    { name: "slug", type: "text", label: "Slug", required: true, unique: true, slugFrom: "name" },
    { name: "location", type: "text", label: "Location", required: true,showInTable: false },
    { name: "priceStart", type: "number", label: "Price Start" },
    { name: "priceEnd", type: "number", label: "Price End" },
    { name: "content", type: "richtext", label: "Content", tab: "Content", required: true, filterable: false },
    { name: "urlMenu", type: "url", label: "Menu URL", tab: "Links",showInTable: false },
    { name: "urlWeb", type: "url", label: "Website URL", tab: "Links",showInTable: false },
    { name: "urlMap", type: "url", label: "Map URL", tab: "Links",showInTable: false },
    { name: "phone", type: "text", label: "Phone", tab: "Links" },
    { name: "embedLink", type: "textarea", label: "Embed Link", tab: "Links", filterable: false,showInTable: false },
    { name: "thumbnail", type: "image", label: "Thumbnail", tab: "General", uploadUrl: "/api/upload?path=uploads/restaurants", showInTable: false },
    { name: "images", type: "gallery", label: "Gallery", tab: "Gallery", uploadUrl: "/api/upload?path=uploads/restaurants",showInTable:false },
    { name: "operationTimes", type: "schedule", label: "Operation Hours", tab: "Schedule", showInTable: false, filterable: false, dayLabels: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] },
    { name: "metaTitle", type: "text", label: "Meta Title", tab: "SEO", showInTable: false, filterable: false },
    { name: "metaDescription", type: "textarea", label: "Meta Description", tab: "SEO", showInTable: false, filterable: false },
    { name: "metaKeywords", type: "text", label: "Meta Keywords", tab: "SEO", showInTable: false, filterable: false },
  ],
  formLayout: [
    {
      columns: [
        {
          weight: 2,
          rows: [
            ["thumbnail"],
            ["name"],
            ["slug"],
            ["location"],
            ["priceStart", "priceEnd"],
          ],
        },
      ],
    },
    {
      rows: [["content"]],
    },
    {
      rows: [
        ["urlWeb", "urlMenu"],
        ["urlMap", "phone"],
        ["embedLink"],
      ],
    },
  ],
  beforeCreate: (data) => {
    const start = data.priceStart;
    const end = data.priceEnd;
    if (start != null && end != null && Number(start) > Number(end)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Price start must be less than or equal to price end.",
      });
    }
  },
  beforeUpdate: (_id, data) => {
    const start = data.priceStart;
    const end = data.priceEnd;
    if (start != null && end != null && Number(start) > Number(end)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Price start must be less than or equal to price end.",
      });
    }
  },
});