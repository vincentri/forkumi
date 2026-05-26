import { defineCRUD } from "@repo/crud";

export const NewsletterSubscriberCRUD = defineCRUD({
  model: "newsletterSubscriber",
  label: "Newsletter Subscribers",
  icon: "Mail",
  navGroup: "Front Page",
  navGroupIcon: "ShieldCheck",
  creatable: false,
  editable: false,
  fields: [
    {
      name: "email",
      type: "email",
      label: "Email",
      required: true,
      unique: true,
    },
  ],
});
