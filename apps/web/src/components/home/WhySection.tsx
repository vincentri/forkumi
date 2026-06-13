"use client";

import { useRef } from "react";
import { AnimatedDiv } from "~/components/home/animations";
import { motion, useScroll, useTransform } from "framer-motion";

const stats = [
  { value: "1", label: "Real Client" },
  { value: "1", label: "Studio Founder" },
  { value: "100%", label: "Craft-Focused" },
];

const quote = {
  text: "They brought the kind of engineering depth that made everyone else on the product team raise their game. They didn't just execute — they made the whole team better.",
  author: "Early Client",
};

interface WhySectionProps {
  siteName: string;
}

export function WhySection({ siteName }: WhySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const quoteX = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0a0a0a] py-20 md:py-32">
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="noise-texture absolute inset-0 opacity-50" />
        <div className="absolute -top-40 right-0 size-[500px] rounded-full bg-[#ff6b35]/10 blur-[150px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        {/* Section label */}
        <div className="section-overline">
          <div className="section-overline-dot" />
          <span className="section-overline-text">Why {siteName}</span>
        </div>

        <div className="mt-12 grid gap-16 md:grid-cols-2 md:gap-24">
          {/* Left: stats */}
          <AnimatedDiv custom={0}>
            <div className="space-y-12">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="group relative"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: "-80px" }}
                >
                  <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#ff6b35]/0 via-[#ff6b35]/40 to-[#ff6b35]/0" />

                  <div className="pl-8">
                    <p className="text-6xl font-bold text-white md:text-7xl">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedDiv>

          {/* Right: pull quote */}
          <AnimatedDiv custom={1}>
            <motion.div
              className="relative"
              style={{ x: quoteX }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="select-none text-[120px] font-bold leading-none text-white/[0.04] absolute -top-8 -left-4">
                &ldquo;
              </div>

              <blockquote className="relative pt-16">
                <p className="text-xl font-semibold italic leading-relaxed text-slate-300 md:text-2xl">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <footer className="mt-8 flex items-center gap-4">
                  <div className="h-px w-8 rounded-full bg-gradient-to-r from-[#ff6b35] to-transparent" />
                  <span className="text-sm text-slate-500">{quote.author}</span>
                </footer>
              </blockquote>
            </motion.div>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  );
}