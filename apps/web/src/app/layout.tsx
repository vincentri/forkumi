export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Playfair_Display, Montserrat, Roboto } from "next/font/google";
import { TRPCProvider } from "~/lib/trpc/provider";
import { getContent } from "~/lib/trpc/server";
import "~/styles/globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const data = await getContent("general");
  return {
    title: data.meta_title,
    description: data.meta_description,
    keywords: data.meta_keywords,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${playfair.variable} ${montserrat.variable} ${roboto.variable}`}>
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
