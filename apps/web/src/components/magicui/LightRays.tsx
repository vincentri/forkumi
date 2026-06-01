"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LightRaysProps {
  className?: string;
  count?: number;
  color?: string;
}

interface Ray {
  id: string;
  left: number;
  rotate: number;
  width: number;
  swing: number;
  delay: number;
  duration: number;
}

function createRays(count: number): Ray[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i}`,
    left: Math.round(10 + Math.random() * 80),
    rotate: Math.round(-20 + Math.random() * 40),
    width: Math.round(80 + Math.random() * 120),
    swing: Math.round(6 + Math.random() * 8),
    delay: Math.round(Math.random() * 8),
    duration: Math.round(8 + Math.random() * 6),
  }));
}

export function LightRays({ className, count = 8, color = "rgba(160,210,255,0.8)" }: LightRaysProps) {
  const [rays, setRays] = useState<Ray[]>([]);

  useEffect(() => {
    setRays(createRays(count));
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 isolate overflow-hidden ${className}`}>
      {/* Top radial glow */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 40% at 50% -10%, ${color}, transparent)`,
        }}
      />

      {/* Light rays */}
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute top-0 origin-top"
          style={{
            left: `${ray.left}%`,
            width: ray.width,
            height: "70vh",
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            filter: "blur(24px)",
          }}
          initial={{ opacity: 0, rotate: ray.rotate }}
          animate={{
            opacity: [0, 0.5, 0],
            rotate: [ray.rotate - ray.swing, ray.rotate + ray.swing, ray.rotate - ray.swing],
          }}
          transition={{
            duration: ray.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ray.delay,
          }}
        />
      ))}
    </div>
  );
}
