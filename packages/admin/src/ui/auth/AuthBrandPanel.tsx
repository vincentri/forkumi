"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface AuthBrandPanelProps {
  tagline: string;
  subtext?: string;
  logoUrl?: string | null;
  appName?: string | null;
}

export function AuthBrandPanel({ tagline, subtext, logoUrl, appName }: AuthBrandPanelProps) {
  const name = appName || "Admin";
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);

  useEffect(() => {
    setLocalLogoUrl(logoUrl);
  }, [logoUrl]);

  return (
    <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_-20%_-10%,_hsl(var(--primary)_/_0.25)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_110%_100%,_hsl(var(--primary)_/_0.12)_0%,_transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative flex items-center gap-3">
        {localLogoUrl ? (
          <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={localLogoUrl} alt={name} fill className="object-contain" unoptimized onError={() => setLocalLogoUrl(null)} />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm leading-none">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-white font-semibold tracking-tight">{name}</span>
      </div>

      <div className="relative space-y-5">
        <h1 className="text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight whitespace-pre-line">
          {tagline}
        </h1>
        {subtext && (
          <p className="text-zinc-400 text-base leading-relaxed max-w-[280px]">{subtext}</p>
        )}
      </div>

      <p className="relative text-zinc-600 text-xs">Built on quantyx</p>
    </div>
  );
}
