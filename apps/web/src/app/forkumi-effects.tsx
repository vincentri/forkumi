"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ForkumiEffects(): null {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    void import("./forkumi-content").then(({ initForkumiSite, rehydrateForkumiPage }) => {
      if (cancelled) return;
      // First mount: full init. Later route changes: rehydrate only.
      if (!(window as unknown as { __FORKUMI_INIT__?: boolean }).__FORKUMI_INIT__) {
        initForkumiSite();
        (window as unknown as { __FORKUMI_INIT__?: boolean }).__FORKUMI_INIT__ = true;
      } else {
        rehydrateForkumiPage();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
