"use client";

import { useRef } from "react";

interface ClientsStripProps {
  clients?: string[];
}

const defaultClients = [
  "Stripe",
  "Vercel",
  "Linear",
  "Notion",
  "Figma",
  "Supabase",
  "PlanetScale",
  "Resend",
  "Clerk",
  "Dub",
];

export function ClientsStrip({ clients = defaultClients }: ClientsStripProps) {
  const duplicates = [...clients, ...clients];

  return (
    <section className="w-full py-12 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-8">
        Trusted by teams at
      </p>
      <div className="relative overflow-hidden">
        <div
          className="flex gap-16 items-center animate-marquee"
          style={{ width: "max-content" }}
        >
          {duplicates.map((client, i) => (
            <span
              key={`${client}-${i}`}
              className="text-slate-300 dark:text-slate-700 font-semibold text-lg whitespace-nowrap select-none"
              style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
            >
              {client}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
