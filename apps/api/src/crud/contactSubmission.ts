import { defineCRUD } from "@repo/crud";

export const ContactSubmissionCRUD = defineCRUD({
  model: "contactSubmission",
  label: "Contact Submissions",
  navGroup: "Inbox",
  icon: "Inbox",
  defaultSortField: "createdAt",
  defaultSortDir: "desc",
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
    },
    {
      name: "email",
      type: "text",
      label: "Email",
      required: true,
    },
    {
      name: "pkg",
      type: "text",
      label: "Plan of Interest",
    },
    {
      name: "message",
      type: "textarea",
      label: "Message",
      required: true,
    },
    {
      name: "locale",
      type: "select",
      label: "Locale",
      required: true,
      default: "id",
      options: [
        { label: "English", value: "en" },
        { label: "Indonesian", value: "id" },
      ],
    },
    {
      name: "createdAt",
      type: "text",
      label: "Submitted",
      showInForm: false,
      showInTable: true,
    },
  ],
});
