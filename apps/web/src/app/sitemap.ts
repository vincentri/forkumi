import type { MetadataRoute } from "next";

import { LOCALES, PAGE_PATHS } from "./markdown";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");

  return PAGE_PATHS.flatMap((pagePath) => {
    const languages = {
      id: new URL(`/id/${pagePath}`, baseUrl).toString(),
      en: new URL(`/en/${pagePath}`, baseUrl).toString(),
      "x-default": new URL(`/id/${pagePath}`, baseUrl).toString(),
    };

    return LOCALES.map((locale) => ({
      url: languages[locale],
      alternates: { languages },
    }));
  });
}
