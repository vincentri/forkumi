import { defineCRUD } from "@repo/crud";

export const BlogCRUD = defineCRUD({
  model: "blog",
  label: "Blogs",
  icon: "Book",
  navGroup: "Blog",
  navGroupIcon: "Book",
  fields: [
    { name: "image", type: "image", label: "Image", filterable: false, sortable: false },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      slugFrom: "title",
    },
    { name: "title", type: "text", label: "Title", required: true },
    { name: "description", type: "text", label: "Description", required: true },
    {
      name: "blogCategoryId",
      type: "select",
      label: "Category",
      optionsFrom: {
        model: "blogCategory",
        valueField: "id",
        labelField: "title",
        orderBy: { title: "asc" },
        where: { status: "published" },
      },
      display: {
        table: "label",
        filter: "select",
      },
    },
    { name: "content", type: "richtext", label: "Content", tab: "Content", required: true, showInTable: false },
    { name: "metaTitle", type: "text", label: "Meta title", tab: "SEO", showInTable: false },
    { name: "metaDescription", type: "textarea", label: "Meta description", tab: "SEO", showInTable: false },
    { name: "metaKeywords", type: "text", label: "Meta keywords", tab: "SEO", showInTable: false },
    { name: "publishedAt", type: "datetime", label: "Published at", default: "now", showInTable: true },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
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
            ["blogCategoryId"],
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
          rows: [
            ["metaTitle"],
            ["metaDescription"],
            ["metaKeywords"],
          ],
        },
      ],
    },
  ],
});
