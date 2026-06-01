"use client";

import { useId } from "react";
import { AnimatedDiv, fadeUp } from "~/components/home/animations";
import { motion } from "framer-motion";

interface LightRaysProps {
  count?: number;
  color?: string;
  className?: string;
}

export function LightRays({ count = 12, color = "rgba(56,189,248,0.5)", className = "" }: LightRaysProps) {
  const id = useId();

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <svg className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <radialGradient id={`rg-${id}`} cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: count }).map((_, i) => {
          const angle = (i / count) * 180;
          const delay = (i / count) * 2;
          return (
            <line
              key={i}
              x1="50%"
              y1="0%"
              x2={`${50 + Math.sin((angle * Math.PI) / 180) * 40}%`}
              y2="100%"
              stroke={color}
              strokeWidth="0.5"
              strokeOpacity="0.6"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: "50% 0%",
              }}
            />
          );
        })}
        <circle cx="50%" cy="0%" r="40%" fill={`url(#rg-${id})`} />
      </svg>
    </div>
  );
}