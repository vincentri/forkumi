"use client";

import { LightRays } from "~/components/ui/light-rays";
import { ShimmerButton } from "~/components/ui/shimmer-button";
import { AnimatedDiv } from "~/components/home/animations";
import { motion } from "framer-motion";

interface ContactCTASectionProps {
  whatsAppHref: string;
  hasWhatsApp: boolean;
}

export function ContactCTASection({ whatsAppHref, hasWhatsApp }: ContactCTASectionProps) {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-32">
      {/* Dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Subtle noise */}
      <div className="noise-texture absolute inset-0 opacity-60" />

      {/* Light rays */}
      <LightRays count={8} color="rgba(255,107,53,0.3)" className="absolute inset-0 rounded-none" />

      <AnimatedDiv>
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <motion.div
            className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-12 md:p-20"
            style={{
              boxShadow: "0_0_0_1px_rgba(255,255,255,.06),0_32px_80px_rgba(0,0,0,.4),0_0_120px_rgba(255,107,53,0.05)",
            }}
          >
            {/* Accent glow behind text */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-64 rounded-full bg-[#ff6b35]/10 blur-[80px] pointer-events-none" />

            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-[2rem] bg-gradient-to-r from-transparent via-[#ff6b35]/60 to-transparent" />

            <AnimatedDiv custom={0}>
              <h2 className="relative z-10 text-center text-[clamp(2rem,5vw,4rem)] font-bold leading-tight text-white">
                Ready to build{" "}
                <span className="text-gradient-accent">something great?</span>
              </h2>
            </AnimatedDiv>

            <AnimatedDiv custom={1}>
              <p className="relative z-10 mt-6 text-center text-lg text-slate-400">
                Whether you have a full brief or just a rough idea — let's talk.
              </p>
            </AnimatedDiv>

            <AnimatedDiv custom={2}>
              <div className="relative z-10 mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <ShimmerButton
                  shimmerColor="rgba(255, 107, 53, 0.5)"
                  shimmerSize="0.04em"
                  shimmerDuration="3s"
                  borderRadius="8px"
                  background="rgba(255, 107, 53, 0.95)"
                  onClick={() => window.open(whatsAppHref, "_blank", "noopener,noreferrer")}
                  className="text-white"
                >
                  {hasWhatsApp ? "Chat on WhatsApp" : "Start a Project"}
                </ShimmerButton>
              </div>
            </AnimatedDiv>
          </motion.div>
        </div>
      </AnimatedDiv>
    </section>
  );
}