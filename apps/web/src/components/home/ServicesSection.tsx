"use client";

import { BentoGrid, BentoCard } from "~/components/magicui/BentoGrid";
import { SparklesText } from "~/components/magicui/SparklesText";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

export function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <SparklesText className="text-3xl font-semibold text-slate-950 dark:text-white md:text-4xl">
              Services
            </SparklesText>
          </motion.div>
          <motion.p variants={fadeUp} custom={1} className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Built for speed, clarity, and engineering depth.
          </motion.p>
        </div>
      </AnimatedDiv>

      <AnimatedDiv>
        <BentoGrid>
          {[
            {
              title: "Product Engineering",
              description: "Web platforms from concept to production with scalable foundations and clean DX.",
              span: "md:col-span-2",
              accent: "sky" as const,
              icon: (
                <svg className="size-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
              ),
            },
            {
              title: "Platform Modernization",
              description: "Refactor legacy systems into maintainable, high-performing delivery machines.",
              span: "md:col-span-1",
              accent: "violet" as const,
              icon: (
                <svg className="size-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              ),
            },
            {
              title: "Team Augmentation",
              description: "Drop-in senior contributors for roadmap-critical execution and technical leadership.",
              span: "md:col-span-3",
              accent: "emerald" as const,
              icon: (
                <svg className="size-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              ),
            },
          ].map((card) => (
            <BentoCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              span={card.span}
              accent={card.accent}
            />
          ))}
        </BentoGrid>
      </AnimatedDiv>
    </section>
  );
}
