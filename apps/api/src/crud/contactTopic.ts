import { defineCRUD } from "@repo/crud";

export const ContactTopicCRUD = defineCRUD({
  model: "contactTopic",
  label: "Topic",
  icon: "Tags",
  navGroup: "Contacts",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
    {
      name: "status",
      type: "select",
      label: "Status",
      required: true,
      default: "inactive",
      options: [
        { label: "Inactive", value: "inactive" },
        { label: "Active", value: "active" },
      ],
    },
  ],
});
