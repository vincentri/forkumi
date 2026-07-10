import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import { ForkumiEffects } from "../forkumi-effects";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  firstValue,
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
  const settings = await getFrontPageSettings(normalizeLocale(rawLocale));
  const title = firstValue(settings.meta_title, settings.site_name) ?? DEFAULT_TITLE;
  const description = firstValue(settings.meta_description) ?? DEFAULT_DESCRIPTION;
  const keywords = firstValue(settings.meta_keywords);
  const favicon = resolveAssetUrl(settings.favicon);

  return {
    title,
    description,
    keywords,
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

  return (
    <>
      <SoftNavInterceptor locale={locale} />
      <ForkumiEffects />
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
