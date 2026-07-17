import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { headers } from "next/headers";
import type { ReactElement, ReactNode } from "react";

import "../styles/forkumi.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
  title: "Forkumi",
  description: "Forkumi design subscription website",
  icons: {
    icon: "/assets/img/favicon-32.png",
    shortcut: "/assets/img/favicon-32.png",
    apple: "/assets/img/favicon-180.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const locale = (await headers()).get("x-forkumi-locale") === "en" ? "en" : "id";

  return (
    <html lang={locale} className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
