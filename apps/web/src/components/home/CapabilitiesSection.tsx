"use client";

import { useRef } from "react";
import { AnimatedDiv } from "~/components/home/animations";
import { motion, useScroll, useTransform } from "framer-motion";

const capabilities = [
  {
    title: "UI/UX Design",
    color: "#ff6b35",
    items: [
      "Research & strategy",
      "Interface design",
      "Prototyping",
      "Design systems",
      "User testing",
    ],
  },
  {
    title: "Digital Products",
    color: "#00d4ff",
    items: [
      "Web apps",
      "Landing pages",
      "E-commerce stores",
      "Launch & scale",
      "Ongoing maintenance",
    ],
  },
  {
    title: "Social Media Management",
    color: "#a855f7",
    items: [
      "Content strategy",
      "Post creation",
      "Audience growth",
      "Analytics & reporting",
      "Paid ads",
    ],
  },
];

export function CapabilitiesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] py-20 md:py-32">
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 size-[500px] rounded-full bg-[#ff6b35]/8 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 size-[400px] rounded-full bg-[#a855f7]/8 blur-[100px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <AnimatedDiv>
          <div className="mb-16">
            <div className="section-overline">
              <div className="section-overline-dot" />
              <span className="section-overline-text dark:text-white/40 text-slate-500">Capabilities</span>
            </div>
            <h2 className="text-headline text-slate-900 dark:text-white">
              What we do.
            </h2>
          </div>
        </AnimatedDiv>

        <div className="grid gap-0 md:grid-cols-3">
          {capabilities.map((cap, i) => (
            <AnimatedDiv key={cap.title} custom={i}>
              <motion.div
                className="group relative border-t border-slate-200 dark:border-white/5 px-8 py-12 dark:bg-[#0a0a0a] flex flex-col h-full"
                whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                viewport={{ once: true, margin: "-80px" }}
              >
                {/* Colored accent line top */}
                <div
                  className="absolute left-0 top-0 w-px opacity-60 dark:block hidden"
                  style={{ background: `linear-gradient(180deg, ${cap.color}, transparent)` }}
                />
                <div
                  className="absolute left-0 top-0 w-px opacity-30 dark:hidden"
                  style={{ background: `linear-gradient(180deg, ${cap.color}, transparent)` }}
                />

                <h3
                  className="text-2xl font-bold md:text-3xl"
                  style={{ color: cap.color }}
                >
                  {cap.title}
                </h3>

                <ul className="space-y-4 mt-auto pt-8">
                  {cap.items.map((item, j) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 + j * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                      viewport={{ once: true }}
                    >
                      <div
                        className="size-1 rounded-full"
                        style={{ background: cap.color, boxShadow: `0 0 6px ${cap.color}` }}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatedDiv>
          ))}
        </div>
      </div>
    </section>
  );
}