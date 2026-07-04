import { defineCRUD } from "@repo/crud";

export const ContactCRUD = defineCRUD({
  model: "contact",
  label: "List Contact",
  icon: "Mail",
  navGroup: "Contacts",
  creatable: false,
  editable: false,
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true,
    },
    {
      name: "topic",
      type: "text",
      label: "Topic",
      required: true,
    },
    { name: "message", type: "richtext", label: "Content", required: true },
  ],
});
