"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function BlurFade({
  children,
  className,
  duration = 0.4,
  delay = 0,
  offset = 8,
  direction = "down",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directionMap = {
    up: { y: offset },
    down: { y: -offset },
    left: { x: offset },
    right: { x: -offset },
  };

  return (
    <div ref={ref} className={className}>
      <AnimatePresence>
        <motion.div
          initial={{
            opacity: 0,
            filter: "blur(8px)",
            ...directionMap[direction],
          }}
          animate={
            isInView
              ? { opacity: 1, filter: "blur(0px)", x: 0, y: 0 }
              : {}
          }
          transition={{
            delay: delay,
            duration,
            ease: "easeOut",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
