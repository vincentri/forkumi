"use client";

interface BrandWordmarkProps {
  siteName: string;
}

export function BrandWordmark({ siteName }: BrandWordmarkProps) {
  return (
    <section className="w-full bg-white dark:bg-slate-950 py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2
          className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
        >
          {siteName}
        </h2>
        <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 to-violet-400" />
      </div>
    </section>
  );
}