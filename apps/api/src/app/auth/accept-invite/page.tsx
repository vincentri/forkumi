export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPublicSettings } from "~/lib/getPublicSettings";
import { AcceptInviteForm } from "./AcceptInviteForm";

export default async function AcceptInvitePage() {
  const settings = await getPublicSettings();
  const logoLightUrl = settings["brandingLogoLightUrl"];
  const logoDarkUrl = settings["brandingLogoDarkUrl"];
  return (
    <Suspense>
      <AcceptInviteForm logoLightUrl={logoLightUrl} logoDarkUrl={logoDarkUrl} appName={settings["brandingAppName"]} />
    </Suspense>
  );
}
