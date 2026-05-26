export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto } from "next/font/google";
import Script from "next/script";
import { TRPCProvider } from "~/lib/trpc/provider";
import { resolveApiPublicUrl } from "~/lib/public-url";
import { getContent } from "~/lib/trpc/server";
import "~/styles/globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"], display: "swap" });
const DEFAULT_FAVICON = "/defaults/admin/default-favicon.png";
const SCRIPT_TAG_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

type ScriptStrategy = "beforeInteractive" | "afterInteractive" | "lazyOnload";
type ManagedScript = { id: string; src?: string; content?: string };

function getScriptSrc(attributes: string): string | undefined {
  const match = attributes.match(/\bsrc=(["'])(.*?)\1/i);
  return match?.[2];
}

function parseManagedScripts(rawScript: string, idPrefix: string): ManagedScript[] {
  const trimmed = rawScript.trim();
  if (!trimmed) return [];

  if (!/<script\b/i.test(trimmed)) {
    return [{ id: `${idPrefix}-0`, content: trimmed }];
  }

  const scripts: ManagedScript[] = [];
  for (const match of trimmed.matchAll(SCRIPT_TAG_PATTERN)) {
    const [, attributes, content] = match;
    const src = getScriptSrc(attributes ?? "");
    scripts.push({
      id: `${idPrefix}-${scripts.length}`,
      src,
      content: src ? undefined : content.trim(),
    });
  }

  return scripts;
}

function ManagedScripts({
  rawScript,
  idPrefix,
  strategy,
}: {
  rawScript?: string;
  idPrefix: string;
  strategy: ScriptStrategy;
}) {
  const scripts = rawScript ? parseManagedScripts(rawScript, idPrefix) : [];

  return (
    <>
      {scripts.map((script) =>
        script.src ? (
          <Script key={script.id} id={script.id} src={script.src} strategy={strategy} />
        ) : (
          <Script key={script.id} id={script.id} strategy={strategy}>
            {script.content}
          </Script>
        ),
      )}
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [seo, general] = await Promise.all([getContent("seo"), getContent("general")]);
  const favicon = resolveApiPublicUrl(general.favicon || DEFAULT_FAVICON);

  return {
    title: seo.meta_title || "Default Template",
    description: seo.meta_description || "A default website template.",
    keywords: seo.meta_keywords,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const scripts = await getContent("scripts");

  return (
    <html lang="id" className={`${playfair.variable} ${montserrat.variable} ${roboto.variable}`}>
      <body>
        <ManagedScripts
          rawScript={scripts.headerScript}
          idPrefix="cms-header-script"
          strategy="beforeInteractive"
        />
        <TRPCProvider>{children}</TRPCProvider>
        <ManagedScripts
          rawScript={scripts.footerScript}
          idPrefix="cms-footer-script"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
