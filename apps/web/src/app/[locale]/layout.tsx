import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
} from "../front-page-settings";

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
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    notFound();
  }

  const settings = await getFrontPageSettings(normalizeLocale(locale));
  const settingsJson = JSON.stringify(settings).replace(/</g, "\\u003c");

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__FORKUMI_FRONT_PAGE_SETTINGS__=${settingsJson};`,
        }}
      />
      {settings.headerScript ? (
        <div
          hidden
          dangerouslySetInnerHTML={{ __html: settings.headerScript }}
        />
      ) : null}
      {children}
      {settings.footerScript ? (
        <div
          hidden
          dangerouslySetInnerHTML={{ __html: settings.footerScript }}
        />
      ) : null}
    </>
  );
}
