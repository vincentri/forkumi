export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { TRPCProvider } from "~/lib/trpc/provider";
import { Toaster, resolveAssetUrl } from "@repo/ui";
import { getPublicSettings } from "~/lib/getPublicSettings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const appName = settings["brandingAppName"] ?? "Admin";
  const faviconUrl = resolveAssetUrl(settings["brandingFaviconUrl"]);

  return {
    title: appName,
    description: "Admin panel",
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="admin-theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if((t||p)==='dark')document.documentElement.classList.add('dark');})()`}
        </Script>
        <TRPCProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}
