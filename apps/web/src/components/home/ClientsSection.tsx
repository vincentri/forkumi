"use client";

import { AnimatedDiv } from "~/components/home/animations";

const techLogos = ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Tailwind", "Vercel", "AWS"];

export function ClientsSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-white dark:bg-slate-950">
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Section label */}
        <AnimatedDiv>
          <div className="section-overline">
            <div className="section-overline-dot" style={{ background: "#00d4ff", boxShadow: "0 0 10px rgba(0,212,254,0.8), 0 0 20px rgba(0,212,254,0.4)" }} />
            <span className="section-overline-text dark:text-white/40 text-slate-500">Tech Stack</span>
          </div>
        </AnimatedDiv>

        <AnimatedDiv custom={0}>
          <h2 className="text-headline text-slate-900 dark:text-white">
            Tools we master.
          </h2>
        </AnimatedDiv>

        {/* Divider */}
        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

        {/* Tech stack marquee */}
        <div className="mt-16 overflow-hidden">
          <div className="animate-marquee flex gap-12 items-center" style={{ animationDuration: "40s" }}>
            {[...techLogos, ...techLogos].map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="whitespace-nowrap rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}