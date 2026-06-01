"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "~/lib/utils";
import { GridPattern } from "~/components/ui/grid-pattern";

interface HeroSectionProps {
  whatsAppHref: string;
  hasWhatsApp: boolean;
}

const headlineWords = ["We", "craft", "brands", "that", "tell", "stories."];
const services = ["UI/UX Design", "Digital Products", "Social Media Management"];

const capabilities = [
  { label: "UI/UX Design", desc: "Interfaces that convert" },
  { label: "Digital Products", desc: "Web apps & stores" },
  { label: "Social Media", desc: "Content that grows your audience" },
  { label: "Brand Identity", desc: "Logos, guidelines & collateral" },
];

// Stagger container variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
} as const;

const fadeItem = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
} as const;

// Deterministic seeded random (LCG — no floating point instability)
function seededRandom(seed: number) {
  // LCG parameters: minimal equidistributed generator, no Math.sin needed
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  const x = (a * seed + c) % m;
  return x / m;
}

// Generate horizontal curved SVG paths — deterministic, no hydration mismatch
function generatePaths(count: number, direction: "left" | "right") {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const seed = i + (direction === "left" ? 0 : 100);
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);
    const r5 = seededRandom(seed + 4);
    const r6 = seededRandom(seed + 5);
    const r7 = seededRandom(seed + 6);
    const r8 = seededRandom(seed + 7);

    const startX = direction === "left" ? 100 + r1 * 20 : -20 - r1 * 20;
    const startY = r2 * 100;
    const endX = direction === "left" ? -20 - r3 * 20 : 100 + r3 * 20;
    const endY = startY + (r4 - 0.5) * 20;
    const cp1x = startX + (direction === "left" ? -1 : 1) * (20 + r5 * 30);
    const cp1y = startY + (r6 - 0.5) * 30;
    const cp2x = endX + (direction === "left" ? 1 : -1) * (20 + r7 * 30);
    const cp2y = endY + (r8 - 0.5) * 30;
    const d = `M${startX},${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
    paths.push({ d, index: i });
  }
  return paths;
}

const pathsLeft = generatePaths(18, "left");
const pathsRight = generatePaths(18, "right");

// Animated SVG path
function AnimatedPath({
  d,
  index,
  className,
}: {
  d: string;
  index: number;
  className?: string;
}) {
  const duration = 20 + (index % 10) * 2;
  const delay = -(index * 0.8) % 20;

  return (
    <motion.path
      d={d}
      strokeWidth="0.5"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{
        pathLength: [0, 1, 1],
        opacity: [0, 0.6, 0.3],
        pathOffset: [0, 0, 1],
      }}
      transition={{
        pathLength: { duration, repeat: Infinity, delay, ease: "linear" },
        opacity: { duration, repeat: Infinity, delay },
        pathOffset: { duration, repeat: Infinity, delay, ease: "linear" },
      }}
      className={className}
    />
  );
}

// Shimmer button
function ShimmerButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn("relative overflow-hidden rounded-lg px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]", className)} {...props}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", backgroundSize: "200% 100%", animation: "shimmer-slide 2.5s ease-in-out infinite" }} />
    </button>
  );
}

export function HeroSection({ whatsAppHref, hasWhatsApp }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100vh] overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">

      {/* Light mode: gradient mesh */}
      <div className="absolute inset-0 dark:hidden" style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 60%, #f8fafc 100%)",
      }} />

      {/* SVG animated paths — light mode */}
      <div className="absolute inset-0 dark:hidden overflow-hidden z-0">
        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {pathsLeft.map(({ d, index }) => (
            <AnimatedPath key={`left-${index}`} d={d} index={index} className="stroke-slate-300" />
          ))}
          {pathsRight.map(({ d, index }) => (
            <AnimatedPath key={`right-${index}`} d={d} index={index} className="stroke-slate-200" />
          ))}
        </svg>
      </div>

      {/* Light mode: grid */}
      <GridPattern className="absolute inset-0 z-[1] opacity-[0.05] dark:hidden" width={64} height={64} strokeDasharray="0" />

      {/* Dark mode: gradient mesh */}
      <div className="absolute inset-0 hidden dark:block" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,107,53,0.1), transparent), radial-gradient(ellipse 60% 40% at 90% 60%, rgba(168,85,247,0.06), transparent), radial-gradient(ellipse 50% 30% at 10% 80%, rgba(0,212,255,0.05), transparent)",
      }} />

      {/* Dark mode: SVG animated paths */}
      <div className="absolute inset-0 hidden dark:block overflow-hidden z-0">
        <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {pathsLeft.map(({ d, index }) => (
            <AnimatedPath key={`left-${index}`} d={d} index={index} className="stroke-white/20" />
          ))}
          {pathsRight.map(({ d, index }) => (
            <AnimatedPath key={`right-${index}`} d={d} index={index} className="stroke-white/10" />
          ))}
        </svg>
      </div>

      {/* Dark mode: grid */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-[1] hidden dark:block">
        <GridPattern className="opacity-15" width={64} height={64} strokeDasharray="0" />
      </motion.div>

      {/* Main content */}
      <motion.div style={{ y: contentY, opacity }} className="relative z-20 mx-auto max-w-7xl px-6 py-32 md:px-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-0">

          {/* Overline */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="section-overline">
              <div className="section-overline-dot" />
              <span className="section-overline-text dark:text-white/40 text-slate-500">Swepee — Digital Craft Studio</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="text-display leading-[1.02] tracking-tight text-slate-900 dark:text-white" style={{ maxWidth: "16ch" }}>
            {headlineWords.map((word, i) => (
              <span key={i} className={cn("mr-[0.18em] inline-block", i === 2 || i === 4 ? "text-[#ff6b35]" : "")}>
                {word}
              </span>
            ))}
          </motion.h1>

          {/* Description + pills row */}
          <motion.div variants={itemVariants} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
                Brand studio building digital presence for businesses that care about craft.
              </p>
              {/* Services pills */}
              <div className="mt-6 flex flex-wrap gap-3">
                {services.map((s) => (
                  <span key={s} className="rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-4 py-2 text-sm text-[#ff6b35]">
                    {s}
                  </span>
                ))}
              </div>
              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
                <ShimmerButton onClick={() => window.location.href = whatsAppHref} className="bg-[#ff6b35] hover:bg-[#ff6b35]/90">
                  Start a Project
                </ShimmerButton>
                <a href="#work" className="group inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3 text-sm font-medium text-slate-700 dark:text-white backdrop-blur-sm transition hover:border-[#ff6b35]/30 hover:bg-slate-100 dark:hover:bg-white/10">
                  See Our Work
                  <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </a>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                  <div className="size-1.5 rounded-full bg-[#ff6b35]" />
                  Reply within 1 business day
                </div>
              </div>
            </div>

            {/* Capabilities grid */}
            <div className="grid grid-cols-2 gap-4">
              {capabilities.map((cap) => (
                <motion.div
                  key={cap.label}
                  variants={fadeItem}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 backdrop-blur-sm"
                  whileHover={{ scale: 1.03, borderColor: "rgba(255,107,53,0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute -bottom-6 -right-6 size-20 rounded-full bg-[#ff6b35]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="relative z-10 text-sm font-semibold text-slate-900 dark:text-white">{cap.label}</p>
                  <p className="relative z-10 mt-1 text-xs text-slate-500 dark:text-slate-400">{cap.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div variants={itemVariants} className="mt-20 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] uppercase tracking-[4px] text-slate-400 dark:text-slate-600">Scroll</span>
              <div className="size-3 rounded-full" style={{ background: "#ff6b35", animation: "count-pulse 2s ease-in-out infinite" }} />
            </div>
          </motion.div>

        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </section>
  );
}