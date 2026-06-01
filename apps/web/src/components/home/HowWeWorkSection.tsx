"use client";

import { useRef } from "react";
import { AnimatedBeam } from "~/components/magicui/AnimatedBeam";
import { SparklesText } from "~/components/magicui/SparklesText";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

export function HowWeWorkSection() {
  const beamContainerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const steps = [
    { num: "01", title: "Discover", body: "Clarify scope, constraints, and measurable outcomes." },
    { num: "02", title: "Build", body: "Ship in milestones with transparent communication and demos." },
    { num: "03", title: "Scale", body: "Harden quality, optimize performance, and support growth." },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <AnimatedDiv>
        <div className="mb-8">
          <motion.div variants={fadeUp} custom={0}>
            <SparklesText className="text-3xl font-semibold text-slate-950 dark:text-slate-100 md:text-4xl">
              How We Work
            </SparklesText>
          </motion.div>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">Transparent phases from scope to scale.</p>
        </div>
      </AnimatedDiv>

      {/* Mobile: vertical stack, no beams */}
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

      {/* Desktop: horizontal grid with animated beams */}
      <div className="relative mt-8 hidden md:block" ref={(el) => { beamContainerRef.current = el; }}>
        <AnimatedBeam
          containerRef={beamContainerRef}
          fromRef={step1Ref}
          toRef={step2Ref}
          curvature={-40}
          gradientStartColor="#38bdf8"
          gradientStopColor="#818cf8"
          delay={0}
          duration={2.5}
          repeatDelay={0.5}
          pathColor="#94a3b8"
          pathWidth={1.5}
          pathOpacity={0.2}
        />
        <AnimatedBeam
          containerRef={beamContainerRef}
          fromRef={step2Ref}
          toRef={step3Ref}
          curvature={-40}
          gradientStartColor="#818cf8"
          gradientStopColor="#c084fc"
          delay={1.5}
          duration={2.5}
          repeatDelay={0.5}
          pathColor="#94a3b8"
          pathWidth={1.5}
          pathOpacity={0.2}
        />

        <div className="relative z-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => {
                if (i === 0) step1Ref.current = el;
                if (i === 1) step2Ref.current = el;
                if (i === 2) step3Ref.current = el;
              }}
            >
              <motion.div
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
