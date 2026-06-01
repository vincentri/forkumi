"use client";

import { NumberTicker } from "~/components/magicui/NumberTicker";
import { SparklesText } from "~/components/magicui/SparklesText";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

const stats = [
  { value: 50, suffix: "+", label: "Projects Delivered", desc: "From MVPs to full-scale platforms, we've shipped across fintech, healthtech, and SaaS.", accent: "sky" },
  { value: 99.9, suffix: "%", label: "Uptime Guarantee", desc: "Production-grade infrastructure with redundant deployments and proactive monitoring.", accent: "violet" },
  { value: 2, prefix: "< ", suffix: " Weeks", label: "To First MVP", desc: "Structured sprints get you from scoped idea to a usable product, fast.", accent: "emerald" },
];

const accentColor = {
  sky: "text-sky-500",
  violet: "text-violet-500",
  emerald: "text-emerald-500",
};

const dividerColor = {
  sky: "bg-sky-200 dark:bg-sky-800",
  violet: "bg-violet-200 dark:bg-violet-800",
  emerald: "bg-emerald-200 dark:bg-emerald-800",
};

export function CapabilityProofSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <SparklesText className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              Capability Proof
            </SparklesText>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Numbers that reflect how we work, not just what we claim.
          </p>
        </div>
      </AnimatedDiv>

      <div className="mt-12 space-y-16">
        {stats.map((stat, i) => (
          <AnimatedDiv key={stat.label} custom={i}>
            <div className={`flex flex-col gap-6 md:flex-row md:items-center ${i % 2 === 0 ? "" : "md:flex-row-reverse"}`}>
              <div className="flex items-baseline gap-2 md:w-1/3">
                {stat.prefix && <span className="text-4xl font-bold text-slate-300 dark:text-slate-700 md:text-6xl">{stat.prefix}</span>}
                <NumberTicker
                  value={stat.value}
                  delay={i * 0.25}
                  className={`text-7xl font-bold md:text-8xl ${accentColor[stat.accent as keyof typeof accentColor]}`}
                />
                <span className="text-4xl font-bold text-slate-300 dark:text-slate-700 md:text-6xl">{stat.suffix}</span>
              </div>
              <div className={`hidden md:block md:w-px md:h-24 ${dividerColor[stat.accent as keyof typeof dividerColor]}`} />
              <div className="md:w-2/3">
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 md:text-2xl">{stat.label}</p>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{stat.desc}</p>
              </div>
            </div>
            {i < 2 && (
              <div className="mt-16 hidden md:block h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
            )}
          </AnimatedDiv>
        ))}
      </div>
    </section>
  );
}
