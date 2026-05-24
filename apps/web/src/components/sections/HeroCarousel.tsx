"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Slide = { image: string; tag?: string; title: string; subtitle: string; ctaLabel?: string; ctaUrl?: string };

const INTERVAL = 5000;

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((i: number) => { setCurrent(i); setProgress(0); }, []);
  const prev = useCallback(() => { setCurrent((c) => (c - 1 + slides.length) % slides.length); setProgress(0); }, [slides.length]);
  const next = useCallback(() => { setCurrent((c) => (c + 1) % slides.length); setProgress(0); }, [slides.length]);

  useEffect(() => {
    const tick = 50;
    const timer = setInterval(() => {
      setProgress((p) => {
        const n = p + (tick / INTERVAL) * 100;
        if (n >= 100) { setCurrent((c) => (c + 1) % slides.length); return 0; }
        return n;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: i === current ? 1 : 0 }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
          </div>
        </div>
      ))}

      <button onClick={prev} className="absolute left-6 top-1/2 z-20 -translate-y-1/2 p-2 text-white/50 transition hover:text-white md:left-10" aria-label="Previous slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button onClick={next} className="absolute right-6 top-1/2 z-20 -translate-y-1/2 p-2 text-white/50 transition hover:text-white md:right-10" aria-label="Next slide">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      <div className="relative z-10 flex h-full items-center justify-center">
        {slides.map((slide, i) => (
          <div key={i} className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out" style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}>
            <div className="px-8 text-center md:px-32">
              {slide.tag && <p className="font-sans font-semibold uppercase text-white/60" style={{ fontSize: "12px", letterSpacing: "2px" }}>{slide.tag}</p>}
              <h1 className="mt-5 font-serif font-bold text-white" style={{ fontSize: "clamp(60px, 8vw, 100px)", lineHeight: "1.0", letterSpacing: "-0.03em" }}>{slide.title}</h1>
              <p className="mx-auto mt-6 max-w-md text-white/70" style={{ fontFamily: "var(--font-roboto)", fontSize: "16px", lineHeight: "1.7" }}>{slide.subtitle}</p>
              {slide.ctaLabel && slide.ctaUrl && (
                <Link href={slide.ctaUrl} className="mt-10 inline-block border border-white/70 text-white font-sans font-semibold uppercase transition hover:bg-white hover:text-[#1A1A1A]" style={{ fontSize: "13px", letterSpacing: "1.5px", padding: "16px 40px" }}>{slide.ctaLabel}</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className="relative h-[2px] overflow-hidden bg-white/25" style={{ width: i === current ? "40px" : "24px" }} aria-label={`Go to slide ${i + 1}`}>
            <span className="absolute inset-y-0 left-0 bg-white transition-none" style={{ width: i === current ? `${progress}%` : i < current ? "100%" : "0%" }} />
          </button>
        ))}
      </div>
    </section>
  );
}
