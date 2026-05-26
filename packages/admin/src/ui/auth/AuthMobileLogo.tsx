"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { resolveAssetUrl } from "@repo/ui";

export interface AuthMobileLogoProps {
  logoUrl?: string | null;
  appName?: string | null;
}

export function AuthMobileLogo({ logoUrl, appName }: AuthMobileLogoProps) {
  const name = appName || "Admin";
  const resolvedLogoUrl = resolveAssetUrl(logoUrl);
  const [localLogoUrl, setLocalLogoUrl] = useState(resolvedLogoUrl);

  useEffect(() => {
    setLocalLogoUrl(resolvedLogoUrl);
  }, [resolvedLogoUrl]);

  return (
    <div className="lg:hidden mb-10 flex items-center gap-2.5">
      {localLogoUrl ? (
        <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={localLogoUrl}
            alt={name}
            fill
            className="object-contain"
            loading="eager"
            fetchPriority="high"
            unoptimized
            onError={() => setLocalLogoUrl(null)}
          />
        </div>
      ) : (
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-bold text-sm leading-none">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span className="font-semibold tracking-tight">{name}</span>
    </div>
  );
}
