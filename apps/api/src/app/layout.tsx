export const dynamic = "force-dynamic";

import type { Metadata } from "next";
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
      <body>        <TRPCProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TRPCProvider>
      </body>
    </html>
  );
}
