"use client";

import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

const quotes = [
  "Clear communication and realistic commitments from day one.",
  "Engineering depth without overcomplicating product decisions.",
  "Delivery quality that supports long-term product confidence.",
  "Ownership mindset from planning through launch.",
];

export function WhatTeamsValueSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <h2 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              What Teams Value
            </h2>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            The intangibles that make every engagement actually work.
          </p>
        </div>
      </AnimatedDiv>

      <div className="mt-12 space-y-16">
        {quotes.map((quote, i) => (
          <AnimatedDiv key={quote} custom={i}>
            <div className="flex items-start gap-6">
              <span className="select-none text-6xl font-bold leading-none text-slate-100 dark:text-slate-800 md:text-8xl">
                &ldquo;
              </span>
              <div className="relative flex-1 pt-4">
                <p className="text-xl font-semibold italic leading-relaxed text-slate-800 dark:text-slate-200 md:text-2xl">
                  {quote}
                </p>
                <div className="mt-3 h-[2px] w-12 rounded-full bg-gradient-to-r from-sky-400 to-violet-400 dark:from-sky-600 dark:to-violet-600" />
              </div>
            </div>
          </AnimatedDiv>
        ))}
      </div>
    </section>
  );
}