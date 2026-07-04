import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import { ForkumiEffects } from "./forkumi-effects";

import "../styles/forkumi.css";

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
    <html lang="en">
      <body>
        <ForkumiEffects />
        {children}
      </body>
    </html>
  );
}
