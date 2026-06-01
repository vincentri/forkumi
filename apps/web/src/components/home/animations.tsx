"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface AnimatedDivProps {
  children: React.ReactNode;
  className?: string;
  variants?: typeof fadeUp;
  custom?: number;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export function AnimatedDiv({ children, className = "", variants, custom, innerRef }: AnimatedDivProps) {
  const ref = innerRef || useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants || stagger}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  );
}
