import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/lib/auth";
import * as CRUDConfigs from "~/crud";
import { toClientCRUDConfig, type CRUDConfig } from "@repo/crud";
import { AdminNav, ThemeProvider } from "@repo/admin/ui";
import { getPublicSettings } from "~/lib/getPublicSettings";
import { customLinks } from "~/lib/customLinks";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, publicSettings] = await Promise.all([
    getServerAuthSession(),
    getPublicSettings(),
  ]);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const appName = publicSettings["brandingAppName"] ?? null;
  const logoLightUrl = publicSettings["brandingLogoLightUrl"] ?? null;
  const logoDarkUrl = publicSettings["brandingLogoDarkUrl"] ?? null;

  const permissions: string[] = session.user.permissions ?? [];
  const isProtectedRole: boolean = session.user.isProtectedRole ?? false;

  const canViewModel = (model: string) =>
    isProtectedRole ||
    permissions.includes(`${model}:view`) ||
    permissions.includes("*:view");

  const allConfigs = Object.values(CRUDConfigs).filter(
    (v): v is CRUDConfig =>
      typeof v === "object" && v !== null && "model" in v && "label" in v,
  );

  const navItems = [
    ...allConfigs.filter((c) => canViewModel(c.model)).map(toClientCRUDConfig),
    ...customLinks.filter((l) => {
      const guard = l.permissions?.[0];
      return !guard || isProtectedRole || permissions.includes(guard) || permissions.includes("*:view");
    }),
  ];

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-muted/30">
        <AdminNav
          navItems={navItems}
          userEmail={session.user.email ?? ""}
          appName={appName}
          logoLightUrl={logoLightUrl}
          logoDarkUrl={logoDarkUrl}
        />
        <main className="flex-1 p-6 pt-16 md:p-8">{children}</main>
      </div>
    </ThemeProvider>
  );
}
