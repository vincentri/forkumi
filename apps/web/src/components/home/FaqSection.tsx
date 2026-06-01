"use client";

import { useState } from "react";
import { AnimatedDiv } from "~/components/home/animations";
import { motion } from "framer-motion";
import { ShimmerButton } from "~/components/ui/shimmer-button";

const faqs: [string, string][] = [
  ["Do you handle end-to-end delivery?", "Yes — from discovery and UX design through to deployment and ongoing maintenance. We don't hand off halfway."],
  ["Can you integrate with an existing team?", "Absolutely. Team augmentation is one of our core engagement models. We slot into your workflow and tooling."],
  ["What project sizes are ideal?", "Most engagements start at MVP scope (2–4 weeks) and scale from there. We also do focused sprint-based work and long-term partnerships."],
  ["How do you handle scope changes?", "We scope carefully upfront. When things shift, we communicate early and propose trade-offs — never surprise bills."],
];

export function FaqSection({ whatsAppHref, hasWhatsApp }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-white dark:bg-slate-950" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Section label */}
        <div className="section-overline">
          <div className="section-overline-dot" />
          <span className="section-overline-text dark:text-white/40 text-slate-500">FAQ</span>
        </div>

        <div className="mt-12 grid gap-16 md:grid-cols-2 md:gap-24">
          {/* Left: accordion */}
          <div>
            <h2 className="text-headline text-slate-900 dark:text-white mb-12">
              Common questions.
            </h2>

            <div className="space-y-3">
              {faqs.map(([q, a], i) => (
                <motion.div
                  key={q}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: "-80px" }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] transition-colors hover:border-[#ff6b35]/30"
                >
                  {/* Left accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff6b35] via-[#00d4ff] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="flex-1 pr-4 text-base font-semibold text-slate-900 dark:text-slate-100">{q}</span>
                    <motion.span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
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
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-6 pb-6 pt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {a}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: CTA card — dark card, dark mode only */}
          <div className="flex items-start">
            <motion.div
              className="relative w-full rounded-2xl border border-white/10 bg-[#0d0018] p-10 dark:bg-white/[0.03]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ff6b35]/10 to-transparent" />

              {/* Accent top line */}
              <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[#ff6b35]/40 to-transparent" />

              <div className="relative z-10">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Get in Touch</p>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to start?
                </h3>
                <p className="text-sm leading-relaxed text-slate-400 mb-8">
                  Tell us about your project. We reply within one business day with a practical starting point — no sales pressure, no generic deck.
                </p>

                <ShimmerButton
                  shimmerColor="rgba(255, 107, 53, 0.4)"
                  shimmerSize="0.04em"
                  shimmerDuration="3s"
                  borderRadius="8px"
                  background="rgba(255, 107, 53, 0.95)"
                  onClick={() => window.location.href = whatsAppHref}
                  className="text-white"
                >
                  {hasWhatsApp ? "Chat on WhatsApp" : "Start a Conversation"}
                </ShimmerButton>

                <div className="mt-8 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-[#ff6b35]" />
                    Available for new projects
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FaqSectionProps {
  whatsAppHref: string;
  hasWhatsApp: boolean;
}