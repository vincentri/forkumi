"use client";

import { Particles } from "~/components/magicui/Particles";
import { PulsatingButton } from "~/components/magicui/PulsatingButton";
import { AuroraText } from "~/components/magicui/AuroraText";
import { WordRotate } from "~/components/magicui/WordRotate";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

interface HeroSectionProps {
  whatsAppHref: string;
  hasWhatsApp: boolean;
}

export function HeroSection({ whatsAppHref, hasWhatsApp }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(59,130,246,0.16),transparent_46%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.12),transparent_44%),linear-gradient(180deg,#ffffff_0%,#f8fbff_60%,#ffffff_100)] dark:hidden" />
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(59,130,246,0.1),transparent_46%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.08),transparent_44%),linear-gradient(180deg,#0f172a_0%,#0f172a_60%,#0f172a_100)]" />
      <Particles
        className="absolute inset-0 z-10"
        quantity={50}
        staticity={90}
        ease={60}
        size={0.4}
        color="#38bdf8"
        vx={0}
        vy={0}
      />

      <div className="pointer-events-none absolute right-0 top-1/2 z-10 mr-[-120px] hidden lg:block">
        <div className="animate-float-bob relative" style={{ animationDelay: "0s" }}>
          <div className="size-72 rounded-full bg-gradient-to-br from-sky-400/30 to-violet-500/20 blur-3xl" />
        </div>
        <div className="absolute -top-16 -left-24 animate-float-bob" style={{ animationDelay: "2s" }}>
          <div className="size-40 rounded-full bg-gradient-to-tr from-pink-400/25 to-fuchsia-500/15 blur-3xl" />
        </div>
        <div className="absolute -bottom-8 -left-12 animate-float-bob" style={{ animationDelay: "4s" }}>
          <div className="size-32 rounded-full bg-gradient-to-bl from-indigo-400/20 to-cyan-400/15 blur-2xl" />
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-6 py-24 md:px-10">
        <div className="max-w-3xl">
          <AnimatedDiv custom={0}>
            <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl lg:text-8xl">
              <AuroraText colors={["#FF0080", "#7928CA", "#0070F3", "#38bdf8"]} speed={0.8}>
                Product engineering, sharpened for scale.
              </AuroraText>
            </h1>
          </AnimatedDiv>

          <AnimatedDiv custom={2}>
            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400 md:text-xl">
              We partner with ambitious teams to{" "}
              <WordRotate
                words={["design", "build", "scale"]}
                className="inline font-semibold text-slate-800 dark:text-slate-200"
                motionProps={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -20 },
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              />{" "}
              products — from first line of code to stable production.
            </p>
          </AnimatedDiv>

          <AnimatedDiv custom={3}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <PulsatingButton href={whatsAppHref} pulseColor="rgba(251,191,36,0.5)">{hasWhatsApp ? "Chat on WhatsApp" : "Contact Us"}</PulsatingButton>
              <a
                href="#services"
                className="group inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm transition hover:border-slate-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800"
              >
                Explore Services
                <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </AnimatedDiv>

          <AnimatedDiv custom={4}>
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                ["100%", "Transparent delivery"],
                ["Senior", "Engineering leads"],
                ["Modern", "Design & arch"],
              ].map(([k, v], i) => (
                <motion.div
                  key={k}
                  variants={fadeUp}
                  custom={i}
                  className="rounded-xl border border-slate-200/80 hover:border-sky-400/40 dark:border-slate-800/80 dark:hover:border-sky-400/40 bg-white/60 dark:bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm dark:shadow-none"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{k}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{v}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  );
}
