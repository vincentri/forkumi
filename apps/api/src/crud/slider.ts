import { defineCRUD } from "@repo/crud";

export const SliderCRUD = defineCRUD({
  model: "slider",
  label: "Slider",
  icon: "Book",
  navGroup: "Front Page",
  navGroupIcon: "Book",
  fields: [
    {
      name: "blog_id",
      type: "select",
      label: "Blog",
      required: true,
      optionsFrom: {
        model: "blog",
        valueField: "id",
        labelField: "title",
        where: { status: "published" },
        orderBy: { title: "asc" },
      },
    },
  ],
});
