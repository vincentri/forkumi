"use client";

import { useState } from "react";
import { SparklesText } from "~/components/magicui/SparklesText";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

const faqs: [string, string][] = [
  ["Do you handle end-to-end delivery?", "Yes, from discovery and UX to deployment and maintenance."],
  ["Can you work with an existing team?", "Yes, we can integrate with your team and current workflow."],
  ["What project size is ideal?", "Most engagements start from focused MVPs to full product modernization."],
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <SparklesText className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              FAQ
            </SparklesText>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Quick answers to get the conversation started.
          </p>
        </div>
      </AnimatedDiv>

      <div className="mt-8 space-y-3">
        {faqs.map(([q, a], i) => (
          <motion.div
            key={q}
            variants={fadeUp}
            custom={i}
            className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            whileHover={{ borderColor: "rgba(14,165,233,0.4)", y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {/* Meteor on hover */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0">
                {Array.from({ length: 10 }).map((_, mi) => (
                  <span
                    key={mi}
                    className="absolute block h-0.5 w-20 rotate-[18deg] bg-gradient-to-r from-sky-400 to-transparent dark:from-slate-400 to-transparent opacity-80"
                    style={{
                      top: `${10 + mi * 15}%`,
                      left: `${-8 + mi * 8}%`,
                      animation: `meteor 2s linear infinite`,
                      animationDelay: `${mi * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <span className="flex-1 text-base font-semibold text-slate-900 dark:text-slate-100">{q}</span>
              <motion.span
                className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                animate={{ rotate: openFaq === i ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </motion.span>
            </button>

            <motion.div
              className="overflow-hidden"
              initial={false}
              animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-6 pb-6 pt-0 text-sm text-slate-600 dark:text-slate-400">
                {a}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
