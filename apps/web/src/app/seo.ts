import type { Metadata } from "next";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  EMAIL_FALLBACK,
  INSTAGRAM_FALLBACK,
  PHONE_FALLBACK,
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
  type FrontPageSettings,
} from "./front-page-settings";
import { parseKeywords } from "./keywords";
import { parsePrice } from "./price";

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
      title: "Tentang Forkumi | Partner desain langganan",
      description:
        "Kenali visi, misi, dan cara Forkumi membantu bisnis mendapatkan desain berkualitas lewat layanan langganan yang fleksibel.",
    },
    en: {
      title: "About Forkumi | Your subscription design team",
      description:
        "Forkumi provides branding, social media, and website design through one monthly subscription.",
    },
  },
  services: {
    descriptionSetting: "servicesPageLead",
    id: {
      title: "Layanan desain grafis langganan | Forkumi",
      description:
        "Dapatkan branding, desain media sosial, website, dan kebutuhan kreatif lainnya dalam satu langganan desain Forkumi.",
    },
    en: {
      title: "Design subscription services | Forkumi",
      description:
        "Forkumi provides branding, social media design, websites, and other creative work through one monthly subscription.",
    },
  },
  portfolio: {
    descriptionSetting: "portfolioPageLead",
    id: {
      title: "Portfolio desain dan website | Forkumi",
      description:
        "Lihat hasil desain, branding, media sosial, dan website yang dikerjakan Forkumi untuk berbagai bisnis dan industri.",
    },
    en: {
      title: "Design and website portfolio | Forkumi",
      description:
        "See branding, social media, design, and website projects Forkumi built for businesses across industries.",
    },
  },
  packages: {
    descriptionSetting: "packagesPageLead",
    id: {
      title: "Paket desain langganan fleksibel | Forkumi",
      description:
        "Pilih paket desain bulanan Forkumi dengan harga transparan, proses fleksibel, dan tanpa kontrak jangka panjang.",
    },
    en: {
      title: "Flexible design subscription plans | Forkumi",
      description:
        "Choose a Forkumi monthly design plan with transparent pricing, flexible service, and no long-term contract.",
    },
  },
  contact: {
    descriptionSetting: "contactIntro",
    id: {
      title: "Hubungi Forkumi | Konsultasi proyek desain",
      description:
        "Diskusikan kebutuhan desain, branding, atau website bersama Forkumi melalui WhatsApp, telepon, email, atau formulir kontak.",
    },
    en: {
      title: "Contact Forkumi | Discuss your design project",
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
  // Home has its own CMS SEO fields; other pages use PAGE_SEO.
  const home = normalizedPagePath === "";
  const title =
    firstValue(
      providedTitle,
      pageCopy?.title,
      home ? settings.homePageSeoMetaTitle : undefined,
      settings.meta_title,
    ) ?? DEFAULT_TITLE;
  const description =
    firstValue(
      providedDescription,
      home ? settings.homePageSeoMetaDescription : undefined,
      // ponytail: CMS leads are short on-page intros ("A few brands we've helped grow."); fallback only.
      pageCopy?.description,
      pageSeo ? settings[pageSeo.descriptionSetting] : undefined,
      settings.meta_description,
    ) ?? DEFAULT_DESCRIPTION;
  const keywords = firstValue(
    providedKeywords,
    home ? settings.homePageSeoMetaKeywords : undefined,
    settings.meta_keywords,
  );
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
      types: {
        "text/markdown": normalizedPagePath
          ? `/${locale}/${normalizedPagePath}.md`
          : `/${locale}.md`,
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

/** generateMetadata for a fixed page path, so pages render statically (no request headers). */
export function pageMetadata(
  pagePath: string,
): (props: { params: Promise<{ locale: string }> }) => Promise<Metadata> {
  return async ({ params }) => {
    const locale = normalizeLocale((await params).locale);
    return buildSeoMetadata({ locale, pagePath, settings: await getFrontPageSettings(locale) });
  };
}

export function buildOrganizationJsonLd(settings: FrontPageSettings): Record<string, unknown> {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
  const resolvedLogo = resolveAssetUrl(settings.logo);
  const logo =
    resolvedLogo && !/^(data:|blob:)/.test(resolvedLogo)
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
  // Entity profiles only; wa.me is a chat link, not a profile (phone lives in contactPoint).
  const sameAs = [
    firstValue(settings.socialInstagramUrl, settings.contactInstagramUrl, INSTAGRAM_FALLBACK),
  ].filter((value): value is string => typeof value === "string" && /^https?:\/\//.test(value));

  const productTerms = parseKeywords(
    firstValue(settings.homePageSeoMetaKeywords, settings.meta_keywords),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": new URL("#organization", baseUrl).toString(),
    name: firstValue(settings.site_name) ?? DEFAULT_TITLE,
    url: baseUrl.toString(),
    description: firstValue(settings.meta_description) ?? DEFAULT_DESCRIPTION,
    // Product terms for agents/search (e.g. "Forkumi design subscription"); same list as meta keywords.
    ...(productTerms.length > 0
      ? { keywords: productTerms.join(", "), knowsAbout: productTerms }
      : {}),
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

export function buildWebsiteJsonLd(settings: FrontPageSettings): Record<string, unknown> {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": new URL("#website", baseUrl).toString(),
    name: firstValue(settings.site_name) ?? DEFAULT_TITLE,
    url: baseUrl.toString(),
    inLanguage: ["id-ID", "en-US"],
    publisher: { "@id": new URL("#organization", baseUrl).toString() },
  };
}

export function buildFaqJsonLd(
  items: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildPlansJsonLd(
  locale: Locale,
  plans: Array<{ name: string; price: string; features: string[] }>,
): Record<string, unknown> {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
  const url = new URL(`/${locale}/packages/`, baseUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: locale === "id" ? "Langganan desain grafis" : "Graphic design subscription",
    serviceType: "Design subscription",
    description: PAGE_SEO.packages[locale].description,
    url,
    provider: { "@id": new URL("#organization", baseUrl).toString() },
    areaServed: { "@type": "Place", name: "Worldwide" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "id" ? "Paket langganan Forkumi" : "Forkumi subscription plans",
      itemListElement: plans.map((plan) => {
        const parsed = parsePrice(plan.price);
        return {
          "@type": "Offer",
          name: plan.name,
          description: plan.features.join(", "),
          url,
          ...(parsed
            ? {
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: parsed.price,
                  priceCurrency: parsed.currency,
                  unitCode: "MON",
                  referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
                },
              }
            : {}),
        };
      }),
    },
  };
}

export function buildBreadcrumbJsonLd(
  locale: Locale,
  page: string,
  current: string,
): Record<string, unknown> {
  const baseUrl = new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "id" ? "Beranda" : "Home",
        item: new URL(`/${locale}/`, baseUrl).toString(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: current,
        item: new URL(`/${locale}/${page}/`, baseUrl).toString(),
      },
    ],
  };
}
