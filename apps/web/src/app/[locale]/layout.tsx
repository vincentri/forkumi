import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactElement, ReactNode } from "react";

import "../../styles/forkumi.css";
import { ForkumiEffects } from "../forkumi-effects";
import { getFrontPageSettings, normalizeLocale, resolveAssetUrl } from "../front-page-settings";
import { ExternalHtmlScripts } from "./_components/ExternalHtmlScripts";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteNav } from "./_components/SiteNav";
import { SiteSplash } from "./_components/SiteSplash";
import { SoftNavInterceptor } from "./_components/SoftNavInterceptor";

const SUPPORTED_LOCALES = ["id", "en"] as const;

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Only listed locales render; anything else 404s instead of rendering on demand.
export const dynamicParams = false;

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: string }> {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

// Root layout (one per locale, so <html lang> is static). Page SEO lives in each page.
export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const settings = await getFrontPageSettings(normalizeLocale(rawLocale));
  const favicon = resolveAssetUrl(settings.favicon) ?? "/assets/img/favicon-32.png";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: resolveAssetUrl(settings.favicon) ?? "/assets/img/favicon-180.png",
    },
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
    <html lang={locale} className={poppins.variable}>
      <body>
        <SoftNavInterceptor locale={locale} />
        <ForkumiEffects />
        <ExternalHtmlScripts id="header" html={settings.headerScript} />
        <SiteSplash settings={settings} />
        <div id="cursor" />
        <div id="dot" />
        <SiteNav locale={locale} settings={settings} />
        <main>{children}</main>
        <SiteFooter locale={locale} settings={settings} />
        <ExternalHtmlScripts id="footer" html={settings.footerScript} />
      </body>
    </html>
  );
}
