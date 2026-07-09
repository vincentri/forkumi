"use client";

import { useEffect, useState, type ReactElement } from "react";

import { resolveAssetUrl } from "../../front-page-settings";

type SiteSplashProps = {
  settings: Record<string, string>;
};

export function SiteSplash({ settings }: SiteSplashProps): ReactElement | null {
  const brand = settings.site_name?.trim() || "Forkumi";
  const logo = resolveAssetUrl(settings.logo) ?? "/assets/img/logo.svg";
  const [gone, setGone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("forkumi_seen")) {
      setGone(true);
      return;
    }
    sessionStorage.setItem("forkumi_seen", "1");
    const t = window.setTimeout(() => setGone(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  // Avoid SSR flash: only render after mount decision
  if (!mounted || gone) return null;

  return (
    <div id="splash">
      <img src={logo} alt={brand} />
      <div className="sname">{brand}</div>
      <div className="bar"><i /></div>
    </div>
  );
}
