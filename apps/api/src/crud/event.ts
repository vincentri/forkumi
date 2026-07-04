import { defineCRUD } from "@repo/crud";

export const EventCRUD = defineCRUD({
  model: "event",
  label: "Events",
  icon: "Calendar",
  navGroup: "Event",
  navGroupIcon: "Book",
  fields: [
    {
      name: "image",
      type: "image",
      label: "Image",
      filterable: false,
      sortable: false,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      slugFrom: "title",
      showInTable: false,
    },
    { name: "title", type: "text", label: "Title", required: true },
    {
      name: "description",
      type: "text",
      label: "Description",
      required: true,
      showInTable: false,
    },
    {
      name: "eventCategoryId",
      type: "select",
      label: "Category",
      optionsFrom: {
        model: "eventCategory",
        valueField: "id",
        labelField: "title",
        orderBy: { title: "asc" },
        where: { status: "published" },
      },
    },
    { name: "location", type: "text", label: "Location", required: true },
    {
      name: "content",
      type: "richtext",
      label: "Content",
      tab: "Content",
      required: true,
      showInTable: false,
    },
    {
      name: "date",
      type: "text",
      label: "Date",
      required: true,
      note: "Example of the format must 24-26 Juni 2026 or 19 Juli 2026",
    },
    { name: "time", type: "text", label: "Time", required: true },
    {
      name: "organizedBy",
      type: "text",
      label: "Organized By",
      required: true,
    },
    {
      name: "metaTitle",
      type: "text",
      label: "Meta title",
      tab: "SEO",
      showInTable: false,
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta description",
      tab: "SEO",
      showInTable: false,
    },
    {
      name: "metaKeywords",
      type: "text",
      label: "Meta keywords",
      tab: "SEO",
      showInTable: false,
    },
    {
      name: "publishedAt",
      type: "datetime",
      label: "Published at",
      default: "now",
      showInTable: true,
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
    },
  ],
  formLayout: [
    {
      columns: [
        {
          weight: 3,
          rows: [
            ["title"],
            ["slug"],
            ["description"],
            ["eventCategoryId"],
            ["status", "publishedAt"],
          ],
        },
        {
          weight: 2,
          rows: [["image"]],
        },
      ],
    },
    {
      rows: [["content"]],
    },
    {
      columns: [
        {
          rows: [["metaTitle"], ["metaDescription"], ["metaKeywords"]],
        },
      ],
    },
  ],
});
