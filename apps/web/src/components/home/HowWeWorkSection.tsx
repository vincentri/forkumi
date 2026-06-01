"use client";

import { useRef } from "react";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Discover", body: "Clarify scope, constraints, and measurable outcomes." },
  { num: "02", title: "Build", body: "Ship in milestones with transparent communication and demos." },
  { num: "03", title: "Scale", body: "Harden quality, optimize performance, and support growth." },
];

export function HowWeWorkSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <h2 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              How We Work
            </h2>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Transparent phases from scope to scale.</p>
        </div>
      </AnimatedDiv>

      {/* Mobile: vertical stack */}
      <div className="mt-8 flex flex-col gap-6 md:hidden">
        {steps.map((step, i) => (
          <motion.div key={step.num} variants={fadeUp} custom={i}>
            <div className="flex items-start gap-4">
              <span className="text-5xl font-bold text-slate-200 dark:text-slate-800">{step.num}</span>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.body}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: horizontal grid */}
      <div className="relative mt-8 hidden md:block">
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              <div className="select-none text-[100px] font-bold leading-none text-slate-100 dark:text-slate-800 md:text-[120px]">
                {step.num}
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}