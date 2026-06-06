import { defineCRUD } from "@repo/crud";

export const FrontPageSettingsCRUD = defineCRUD({
  model: "frontPageSettings",
  label: "Settings",
  mode: "keyValue", // switches UI to settings-style form
  navGroup: "Front Page", // optional sidebar group
  icon: "Settings",
  fields: [
    {
      namespace: "general",
      name: "logo",
      type: "image",
      label: "Logo (Light Mode)",
      tab: "General",
      uploadUrl: "/api/upload?path=uploads/logo",
      width: "half",
    },
    {
      namespace: "general",
      name: "logo_dark",
      type: "image",
      label: "Logo (Dark Mode)",
      tab: "General",
      uploadUrl: "/api/upload?path=uploads/logo-dark",
      width: "half",
    },
    {
      namespace: "general",
      name: "favicon",
      type: "image",
      label: "Favicon",
      tab: "General",
      uploadUrl: "/api/upload?path=uploads/favicon",
    },
    {
      namespace: "general",
      name: "site_name",
      type: "text",
      label: "Site Name",
      tab: "General",
    },
    {
      namespace: "contact",
      name: "whatsapp",
      type: "text",
      label: "WhatsApp",
      tab: "Contact",
    },
    {
      namespace: "contact",
      name: "whatsapp_message",
      type: "textarea",
      label: "WhatsApp Default Message",
      tab: "Contact",
    },
    {
      namespace: "seo",
      name: "meta_title",
      type: "text",
      label: "Meta Title",
      tab: "SEO",
    },
    {
      namespace: "seo",
      name: "meta_description",
      type: "text",
      label: "Meta Description",
      tab: "SEO",
    },
    {
      namespace: "seo",
      name: "meta_keywords",
      type: "text",
      label: "Meta Keywords",
      tab: "SEO",
    },
    {
      name: "headerScript",
      type: "textarea",
      label: "Header Script",
      tab: "Scripts",
      namespace: "scripts",
    },
    {
      name: "footerScript",
      type: "textarea",
      label: "Footer Script",
      tab: "Scripts",
      namespace: "scripts",
    },
  ],
});
