"use client";

import { useRef } from "react";
import { AnimatedDiv } from "~/components/home/animations";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  { num: "01", title: "Discover", desc: "We dig into your goals, constraints, and users — no assumptions, no fluff." },
  { num: "02", title: "Define", desc: "We map the product architecture and align on what success looks like." },
  { num: "03", title: "Design", desc: "Iterative interface work with continuous feedback loops and a sharp eye for craft." },
  { num: "04", title: "Deploy", desc: "Clean code, thorough QA, and a launch plan that doesn't break under pressure." },
];

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "-50%"]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        {/* Section label */}
        <div className="section-overline">
          <div className="section-overline-dot" />
          <span className="section-overline-text dark:text-white/40 text-slate-500">Process</span>
        </div>
        <h2 className="text-headline text-slate-900 dark:text-white mb-16">
          How we ship.
        </h2>

        {/* Desktop: horizontal scroll */}
        <div ref={containerRef} className="relative hidden md:block">
          <motion.div style={{ x }} className="flex gap-8 pb-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="group relative flex-shrink-0"
                style={{ width: "360px" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-xl p-8 h-full transition-all duration-500 hover:border-[#ff6b35]/30 hover:shadow-lg hover:shadow-[#ff6b35]/5">
                  {/* Large number */}
                  <div className="select-none text-[80px] font-bold leading-none text-slate-100 dark:text-white/5 mb-4">
                    {step.num}
                  </div>

                  {/* Accent line */}
                  <div
                    className="h-[2px] w-12 mb-6 rounded-full"
                    style={{ background: "linear-gradient(90deg, #ff6b35, transparent)" }}
                  />

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: vertical stack */}
        <div className="flex flex-col gap-4 md:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-5xl font-bold text-slate-100 dark:text-white/10">{step.num}</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}