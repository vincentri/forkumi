import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import { ForkumiEffects } from "../forkumi-effects";
import { buildOrganizationJsonLd, buildSeoMetadata, serializeJsonLd } from "../seo";
import {
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
} from "../front-page-settings";
import { ExternalHtmlScripts } from "./_components/ExternalHtmlScripts";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteNav } from "./_components/SiteNav";
import { SiteSplash } from "./_components/SiteSplash";
import { SoftNavInterceptor } from "./_components/SoftNavInterceptor";

const SUPPORTED_LOCALES = ["id", "en"] as const;

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: string }> {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const settings = await getFrontPageSettings(locale);
  const favicon = resolveAssetUrl(settings.favicon);
  const pagePath = (await headers()).get("x-forkumi-page-path") ?? "";

  return {
    ...buildSeoMetadata({ locale, pagePath, settings }),
    icons: favicon ? {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    } : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  if (!SUPPORTED_LOCALES.includes(rawLocale as (typeof SUPPORTED_LOCALES)[number])) {
    notFound();
  }

  const settings = await getFrontPageSettings(locale);
  const organizationJsonLd = serializeJsonLd(buildOrganizationJsonLd(settings));

  return (
    <>
      <SoftNavInterceptor locale={locale} />
      <ForkumiEffects />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
      />
      <ExternalHtmlScripts id="header" html={settings.headerScript} />
      <SiteSplash settings={settings} />
      <div id="cursor" /><div id="dot" />
      <SiteNav locale={locale} settings={settings} />
      {children}
      <SiteFooter locale={locale} settings={settings} />
      <ExternalHtmlScripts id="footer" html={settings.footerScript} />
    </>
  );
}
