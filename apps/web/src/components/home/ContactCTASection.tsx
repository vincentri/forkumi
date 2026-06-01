"use client";

import { LightRays } from "~/components/magicui/LightRays";
import { PulsatingButton } from "~/components/magicui/PulsatingButton";
import { SparklesText } from "~/components/magicui/SparklesText";
import { BlurFade } from "~/components/magicui/BlurFade";
import { AnimatedDiv } from "~/components/home/animations";

interface ContactCTASectionProps {
  whatsAppHref: string;
  hasWhatsApp: boolean;
}

export function ContactCTASection({ whatsAppHref, hasWhatsApp }: ContactCTASectionProps) {
  return (
    <section id="contact" className="relative w-full py-20 overflow-hidden">
      {/* Dot pattern background */}
      <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.08]" style={{
        backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <LightRays count={12} color="rgba(56,189,248,0.5)" className="rounded-3xl" />

      <AnimatedDiv>
        <div className="relative z-10 mx-auto max-w-4xl rounded-3xl border border-sky-200/60 dark:border-sky-800/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-10 md:p-16 shadow-xl">
          <BlurFade delay={0}>
            <SparklesText className="text-4xl font-bold text-slate-900 dark:text-slate-100 md:text-5xl">
              Let&apos;s Build Your Next Product
            </SparklesText>
          </BlurFade>
          <BlurFade delay={0.1}>
            <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Share your scope and timeline. We reply with a practical plan and recommended starting path.
            </p>
          </BlurFade>
          <BlurFade delay={0.2}>
            <div className="mt-8">
              <PulsatingButton href={whatsAppHref} pulseColor="rgba(251,191,36,0.5)">
                {hasWhatsApp ? "Chat on WhatsApp" : "Contact Us"}
              </PulsatingButton>
            </div>
          </BlurFade>
        </div>
      </AnimatedDiv>
    </section>
  );
}
