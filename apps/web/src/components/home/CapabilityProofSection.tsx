"use client";

import { useEffect, useState } from "react";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

interface StatProps {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  desc: string;
  accent: "sky" | "violet" | "emerald";
  delay: number;
}

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

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2000;

    const timer = setTimeout(() => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(parseFloat((eased * value).toFixed(value % 1 !== 0 ? 1 : 0)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return <>{display}</>;
}

export function CapabilityProofSection() {
  const stats = [
    { value: 1, prefix: "", suffix: "", label: "Real Client Delivered", desc: "Hoz Pasta — authentic Italian restaurant brand site, live and serving customers daily.", accent: "sky" as const },
    { value: 3, prefix: "", suffix: "", label: "Core Services", desc: "UI/UX Design · Digital Products · Social Media Management", accent: "violet" as const },
    { value: 100, prefix: "", suffix: "%", label: "Craft-Focused", desc: "No template shortcuts. Every project gets our full attention and expertise.", accent: "emerald" as const },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <h2 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              Capability Proof
            </h2>
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
                <span className={`text-7xl font-bold md:text-8xl ${accentColor[stat.accent]}`}>
                  <AnimatedNumber value={stat.value} delay={i * 0.25} />
                </span>
                <span className="text-4xl font-bold text-slate-300 dark:text-slate-700 md:text-6xl">{stat.suffix}</span>
              </div>
              <div className={`hidden md:block md:w-px md:h-24 ${dividerColor[stat.accent]}`} />
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