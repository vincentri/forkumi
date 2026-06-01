"use client";

import { OrbitingCircles } from "~/components/magicui/OrbitingCircles";
import { SparklesText } from "~/components/magicui/SparklesText";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

const outerTech = ["Next.js", "TypeScript", "Node.js", "PostgreSQL"];
const innerTech = ["Prisma", "tRPC", "Tailwind", "Vercel"];

export function TechStackSection() {
  return (
    <section className="relative w-full py-16 overflow-hidden">
      {/* CSS dot pattern background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20" style={{
        backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />

      <AnimatedDiv>
        <div className="relative z-10 mx-auto max-w-6xl px-6 mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <SparklesText className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              Tech Stack
            </SparklesText>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Modern tools, battle-tested choices for production at scale.
          </p>
        </div>
      </AnimatedDiv>

      <div className="relative z-10 mx-auto max-w-6xl px-6 mt-12 flex min-h-[520px] items-center justify-center">
        <div className="absolute z-10 flex flex-col items-center">
          <span className="text-5xl font-bold text-slate-900 dark:text-slate-100 md:text-6xl">8+</span>
          <span className="mt-2 text-xs uppercase tracking-widest text-slate-400 dark:text-slate-600">Technologies</span>
        </div>

        <OrbitingCircles
          radius={200}
          duration={28}
          speed={0.5}
          iconSize={72}
          className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
        >
          {outerTech.map((name) => (
            <div key={name} className="flex size-[72px] items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{name}</span>
            </div>
          ))}
        </OrbitingCircles>

        <OrbitingCircles
          radius={100}
          duration={18}
          speed={0.7}
          reverse
          iconSize={60}
          className="border border-slate-100 dark:border-slate-800"
        >
          {innerTech.map((name) => (
            <div key={name} className="flex size-[60px] items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{name}</span>
            </div>
          ))}
        </OrbitingCircles>
      </div>
    </section>
  );
}
