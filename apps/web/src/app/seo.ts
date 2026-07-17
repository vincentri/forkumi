import type { Metadata } from "next";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  EMAIL_FALLBACK,
  INSTAGRAM_FALLBACK,
  PHONE_FALLBACK,
  WHATSAPP_FALLBACK,
  firstValue,
  resolveAssetUrl,
  type FrontPageSettings,
} from "./front-page-settings";

type Locale = "id" | "en";

type SeoCopy = {
  title: string;
  description: string;
};

type PageSeo = Record<Locale, SeoCopy> & {
  descriptionSetting: string;
};

const PAGE_SEO = {
  about: {
    descriptionSetting: "pageAboutLead",
    id: {
      title: "Tentang Forkumi | Partner Desain Langganan",
      description:
        "Kenali visi, misi, dan cara Forkumi membantu bisnis mendapatkan desain berkualitas lewat layanan langganan yang fleksibel.",
    },
    en: {
      title: "About Forkumi | Your Subscription Design Team",
      description:
        "Meet Forkumi and learn how our flexible design subscription helps businesses access reliable, high-quality creative support.",
    },
  },
  services: {
    descriptionSetting: "servicesPageLead",
    id: {
      title: "Layanan Desain Grafis Langganan | Forkumi",
      description:
        "Dapatkan branding, desain media sosial, website, dan kebutuhan kreatif lainnya dalam satu langganan desain Forkumi.",
    },
    en: {
      title: "Design Subscription Services | Forkumi",
      description:
        "Get branding, social media design, websites, and other creative services through one flexible Forkumi design subscription.",
    },
  },
  portfolio: {
    descriptionSetting: "portfolioPageLead",
    id: {
      title: "Portfolio Desain dan Website | Forkumi",
      description:
        "Lihat hasil desain, branding, media sosial, dan website yang dikerjakan Forkumi untuk berbagai bisnis dan industri.",
    },
    en: {
      title: "Design and Website Portfolio | Forkumi",
      description:
        "Explore branding, social media, design, and website projects created by Forkumi for businesses across different industries.",
    },
  },
  packages: {
    descriptionSetting: "packagesPageLead",
    id: {
      title: "Paket Desain Langganan Fleksibel | Forkumi",
      description:
        "Pilih paket desain bulanan Forkumi dengan harga transparan, proses fleksibel, dan tanpa kontrak jangka panjang.",
    },
    en: {
      title: "Flexible Design Subscription Plans | Forkumi",
      description:
        "Choose a Forkumi monthly design plan with transparent pricing, flexible service, and no long-term contract.",
    },
  },
  contact: {
    descriptionSetting: "contactIntro",
    id: {
      title: "Hubungi Forkumi | Konsultasi Proyek Desain",
      description:
        "Diskusikan kebutuhan desain, branding, atau website bersama Forkumi melalui WhatsApp, telepon, email, atau formulir kontak.",
    },
    en: {
      title: "Contact Forkumi | Discuss Your Design Project",
      description:
        "Discuss your design, branding, or website needs with Forkumi through WhatsApp, phone, email, or our contact form.",
    },
  },
} satisfies Record<string, PageSeo>;

type BuildSeoMetadataInput = {
  locale: Locale;
  pagePath: string;
  settings: FrontPageSettings;
  title?: string;
  description?: string;
  keywords?: string;
};

export function buildSeoMetadata({
  locale,
  pagePath,
  settings,
  title: providedTitle,
  description: providedDescription,
  keywords: providedKeywords,
}: BuildSeoMetadataInput): Metadata {
  const normalizedPagePath = pagePath.replace(/^\/+|\/+$/g, "");
  const pageSeo = PAGE_SEO[normalizedPagePath as keyof typeof PAGE_SEO];
  const pageCopy = pageSeo?.[locale];
  const title = firstValue(providedTitle, pageCopy?.title, settings.meta_title) ?? DEFAULT_TITLE;
  const description =
    firstValue(
      providedDescription,
      pageSeo ? settings[pageSeo.descriptionSetting] : undefined,
      pageCopy?.description,
      settings.meta_description,
    ) ?? DEFAULT_DESCRIPTION;
  const keywords = firstValue(providedKeywords, settings.meta_keywords);
  const localizedPath = (targetLocale: Locale): string =>
    normalizedPagePath ? `/${targetLocale}/${normalizedPagePath}/` : `/${targetLocale}/`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: localizedPath(locale),
      languages: {
        id: localizedPath("id"),
        en: localizedPath("en"),
        "x-default": localizedPath("id"),
      },
    },
    openGraph: {
      type: "website",
      url: localizedPath(locale),
      title,
      description,
      siteName: firstValue(settings.site_name) ?? DEFAULT_TITLE,
      locale: locale === "id" ? "id_ID" : "en_US",
      alternateLocale: [locale === "id" ? "en_US" : "id_ID"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildOrganizationJsonLd(settings: FrontPageSettings): Record<string, unknown> {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
  const resolvedLogo = resolveAssetUrl(settings.logo);
  const logo = resolvedLogo && !/^(data:|blob:)/.test(resolvedLogo)
    ? new URL(resolvedLogo, baseUrl).toString()
    : undefined;
  const email =
    firstValue(
      settings.contactEmailLabel,
      settings.contactEmailUrl?.replace(/^mailto:/, ""),
      EMAIL_FALLBACK.replace(/^mailto:/, ""),
    ) ?? undefined;
  const telephone =
    firstValue(
      settings.contactPhoneLabel,
      settings.contactPhoneUrl?.replace(/^tel:/, ""),
      PHONE_FALLBACK.replace(/^tel:/, ""),
    ) ?? undefined;
  const sameAs = Array.from(new Set([
    firstValue(settings.socialInstagramUrl, settings.contactInstagramUrl, INSTAGRAM_FALLBACK),
    firstValue(settings.socialWhatsappUrl, settings.contactWhatsappUrl, WHATSAPP_FALLBACK),
  ].filter((value): value is string => typeof value === "string" && /^https?:\/\//.test(value))));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": new URL("#organization", baseUrl).toString(),
    name: firstValue(settings.site_name) ?? DEFAULT_TITLE,
    url: baseUrl.toString(),
    description: firstValue(settings.meta_description) ?? DEFAULT_DESCRIPTION,
    logo,
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email,
      telephone,
      availableLanguage: ["Indonesian", "English"],
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
