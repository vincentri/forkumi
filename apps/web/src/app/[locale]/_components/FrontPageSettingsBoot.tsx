"use client";

import { useLayoutEffect, type ReactElement } from "react";

declare global {
  interface Window {
    __FORKUMI_FRONT_PAGE_SETTINGS__?: Record<string, string>;
  }
}

type FrontPageSettingsBootProps = {
  settings: Record<string, string>;
};

export function FrontPageSettingsBoot({
  settings,
}: FrontPageSettingsBootProps): ReactElement | null {
  // useLayoutEffect runs before ForkumiEffects' useEffect, so settings are ready.
  useLayoutEffect(() => {
    window.__FORKUMI_FRONT_PAGE_SETTINGS__ = settings;
  }, [settings]);

  return null;
}
