export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPublicSettings } from "~/lib/getPublicSettings";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const settings = await getPublicSettings();
  const logoLightUrl = settings["brandingLogoLightUrl"];
  const logoDarkUrl = settings["brandingLogoDarkUrl"];
  return (
    <Suspense>
      <SignInForm
        logoLightUrl={logoLightUrl}
        logoDarkUrl={logoDarkUrl}
        appName={settings["brandingAppName"]}
        heroTitle={settings["brandingLoginTitle"]}
        heroSubtitle={settings["brandingLoginSubtitle"]}
      />
    </Suspense>
  );
}
