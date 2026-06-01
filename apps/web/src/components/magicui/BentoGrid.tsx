"use client";

import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { motion } from "framer-motion";

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null };
function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ");
}

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  title: string;
  description: string;
  icon: ReactNode;
  span?: string;
  accent?: "sky" | "violet" | "emerald" | "amber";
}

const accentStyles = {
  sky: {
    bg: "bg-gradient-to-br from-sky-400/20 to-sky-500/10 dark:from-sky-400/10 dark:to-sky-500/5",
    icon: "text-sky-500",
    glow: "rgba(56,189,248,0.3)",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-400/20 to-violet-500/10 dark:from-violet-400/10 dark:to-violet-500/5",
    icon: "text-violet-500",
    glow: "rgba(139,92,246,0.3)",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 dark:from-emerald-400/10 dark:to-emerald-500/5",
    icon: "text-emerald-500",
    glow: "rgba(52,211,153,0.3)",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-400/20 to-amber-500/10 dark:from-amber-400/10 dark:to-amber-500/5",
    icon: "text-amber-500",
    glow: "rgba(251,191,36,0.3)",
  },
};

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn("grid w-full gap-4 md:grid-cols-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon,
  span = "col-span-1 row-span-1",
  accent = "sky",
  className,
}: BentoCardProps) {
  const style = accentStyles[accent];

  return (
    <motion.div
      key={title}
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-1",
        span,
        className
      )}
      whileHover={{ y: -6, scale: 1.02, boxShadow: `0 24px 60px -12px ${style.glow}`, borderColor: `${style.glow}` }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
    >
      {/* Background accent orb */}
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full ${style.bg} blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:blur-2xl`} />

      <div className="relative z-10">
        <div className={`mb-4 flex size-12 items-center justify-center rounded-xl ${style.bg} backdrop-blur-sm`}>
          <span className={`${style.icon} scale-125`}>{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-slate-50/40 dark:group-hover:bg-slate-800/20" />
    </motion.div>
  );
}
