import { defineCRUD } from "@repo/crud";

export const SidebarPinnedRestaurantCRUD = defineCRUD({
  model: "sidebarPinnedRestaurant",
  label: "Sidebar Pinned Restaurant",
  icon: "UtensilsCrossed",
  navGroup: "Front Page",
  navGroupIcon: "Book",
  fields: [
    {
      name: "restaurantId",
      type: "select",
      label: "Restaurant",
      required: true,
      optionsFrom: {
        model: "restaurant",
        valueField: "id",
        labelField: "name",
        orderBy: { name: "asc" },
      },
    },
    {
      name: "position",
      type: "number",
      label: "Position",
      required: true,
    },
  ],
});
