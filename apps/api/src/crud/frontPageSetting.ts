import { defineCRUD } from "@repo/crud";

export const FrontPageSettingsCRUD = defineCRUD({
  model: "frontPageSettings",
  label: "Settings",
  mode: "keyValue", // switches UI to settings-style form
  navGroup: "Front Page", // optional sidebar group
  icon: "Settings",
  // ponytail: locale switcher is rendered for every field on this form; admins
  // translate just the SEO fields per locale and leave the rest on "en".
  // Per-field locale scoping lands later if general/scripts ever need translation.
  supportedLocales: ["en", "id"],
  defaultLocale: "en",
  fields: [
    {
      namespace: "general",
      name: "logo",
      type: "image",
      label: "Logo",
      tab: "General",
      uploadUrl: "/api/upload?path=uploads/logo",
      width: "half",
    },
    {
      namespace: "general",
      name: "favicon",
      type: "image",
      label: "Favicon",
      tab: "General",
      uploadUrl: "/api/upload?path=uploads/favicon",
      width: "half",
    },
    {
      namespace: "general",
      name: "site_name",
      type: "text",
      label: "Site Name",
      tab: "General",
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
      namespace: "seo",
      name: "seoHomePageSeo",
      type: "separator",
      label: "Home Page SEO",
      tab: "SEO",
      showInTable: false,
    },
    {
      namespace: "seo",
      name: "homePageSeoMetaTitle",
      type: "text",
      label: "Meta Title Home Page",
      tab: "SEO",
    },
    {
      namespace: "seo",
      name: "homePageSeoMetaDescription",
      type: "text",
      label: "Meta Description Home Page",
      tab: "SEO",
    },
    {
      namespace: "seo",
      name: "homePageSeoMetaKeywords",
      type: "text",
      label: "Meta Keywords Home Page",
      tab: "SEO",
    },
    {
      namespace: "scripts",
      name: "headerScript",
      type: "textarea",
      label: "Header Script",
      tab: "Scripts",
    },
    {
      namespace: "scripts",
      name: "footerScript",
      type: "textarea",
      label: "Footer Script",
      tab: "Scripts",
    },
  ],
});
