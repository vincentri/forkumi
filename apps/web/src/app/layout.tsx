export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto } from "next/font/google";
import { TRPCProvider } from "~/lib/trpc/provider";
import { resolveApiPublicUrl } from "~/lib/public-url";
import { getContent } from "~/lib/trpc/server";
import "~/styles/globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"], display: "swap" });
const DEFAULT_FAVICON = "/defaults/admin/default-favicon.png";

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
      {scripts.headerScript && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: scripts.headerScript }} />
        </head>
      )}
      <body>
        <TRPCProvider>{children}</TRPCProvider>
        {scripts.footerScript && <script dangerouslySetInnerHTML={{ __html: scripts.footerScript }} />}
      </body>
    </html>
  );
}
