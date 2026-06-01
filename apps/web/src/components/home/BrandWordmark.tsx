"use client";

import { VideoText } from "~/components/magicui/VideoText";

interface BrandWordmarkProps {
  siteName: string;
}

export function BrandWordmark({ siteName }: BrandWordmarkProps) {
  return (
    <section className="w-full bg-white dark:bg-slate-950 py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <VideoText
          src="https://cdn.magicui.design/ocean-small.webm"
          className="w-full h-40 md:h-64"
          fontSize={15}
          fontWeight="800"
          fontFamily="var(--font-satoshi), sans-serif"
        >
          {siteName}
        </VideoText>
      </div>
    </section>
  );
}
