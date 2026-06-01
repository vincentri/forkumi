"use client";

import { motion, useScroll } from "framer-motion";

interface ScrollProgressProps {
  className?: string;
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={`fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-sky-400 via-violet-400 to-sky-400 dark:from-sky-400 dark:via-violet-400 dark:to-sky-400 ${className ?? ""}`}
      style={{ scaleX: scrollYProgress }}
    />
  );
}
