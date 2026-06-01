"use client";

import { useRef } from "react";
import { BentoGrid, BentoCard } from "~/components/ui/bento-grid";
import { AnimatedDiv } from "~/components/home/animations";
import { motion, useScroll, useTransform } from "framer-motion";

const work = [
  {
    name: "Hoz Pasta",
    description: "Authentic Italian restaurant brand site — Jakarta. Chef Joko's 40-year craft, online. From Sea to Table.",
    tags: ["UX", "Dev"],
    href: "https://hozpasta.com",
    Icon: () => (
      <svg className="size-6 text-slate-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .37" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const cardsY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section ref={ref} id="work" className="relative overflow-hidden py-20 md:py-32 bg-white dark:bg-slate-950">
      {/* Parallax background glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-[#ff6b35]/5 dark:bg-[#ff6b35]/10 blur-[120px]" />
        <div className="absolute top-1/2 left-0 size-[400px] rounded-full bg-[#a855f7]/5 dark:bg-[#a855f7]/10 blur-[100px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <AnimatedDiv>
          <div className="mb-4">
            <div className="section-overline">
              <div className="section-overline-dot" />
              <span className="section-overline-text dark:text-white/40 text-slate-500">Selected Work</span>
            </div>
            <h2 className="text-headline text-slate-900 dark:text-white">
              Where craft meets the table.
            </h2>
            <p className="mt-3 max-w-lg text-base text-slate-500 dark:text-slate-400">
              Real work. No placeholder filler.
            </p>
          </div>
        </AnimatedDiv>

        <motion.div style={{ y: cardsY }}>
          <AnimatedDiv>
            <BentoGrid className="mt-12">
              {work.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: "-80px" }}
                >
                  <BentoCard
                    name={item.name}
                    description={item.description}
                    Icon={item.Icon}
                    tags={item.tags}
                    href={item.href}
                  />
                </motion.div>
              ))}
            </BentoGrid>
          </AnimatedDiv>
        </motion.div>
      </div>
    </section>
  );
}