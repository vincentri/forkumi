import { defineCRUD } from "@repo/crud";

export const SidebarPinnedEventCRUD = defineCRUD({
  model: "sidebarPinnedEvent",
  label: "Sidebar Pinned Event",
  icon: "CalendarDays",
  navGroup: "Front Page",
  navGroupIcon: "Book",
  fields: [
    {
      name: "eventId",
      type: "select",
      label: "Event",
      required: true,
      optionsFrom: {
        model: "event",
        valueField: "id",
        labelField: "title",
        where: { status: "published" },
        orderBy: { title: "asc" },
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
