"use client";

export default function ScrollTopButton() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="absolute right-0 flex h-9 w-9 items-center justify-center bg-white text-dark transition hover:bg-white/80" aria-label="Scroll to top">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
    </button>
  );
}
