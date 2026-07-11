import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import type { ReactElement, ReactNode } from "react";

import "../styles/forkumi.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forkumi",
  description: "Forkumi design subscription website",
  icons: {
    icon: "/assets/img/favicon-32.png",
    shortcut: "/assets/img/favicon-32.png",
    apple: "/assets/img/favicon-180.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="id" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
