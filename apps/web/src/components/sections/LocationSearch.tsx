"use client";

import { useState, useRef, useEffect } from "react";

type Location = { name: string; sub: string; map: string };

export default function LocationSearch({ locations }: { locations: Location[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filtered = query.trim()
    ? locations.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()) || l.sub.toLowerCase().includes(query.toLowerCase()))
    : locations;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative mx-auto mt-10 max-w-sm text-left">
      <div className={`flex items-center border border-white/15 bg-transparent px-4 transition ${open ? "border-white/30" : ""}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Cari lokasi..." className="flex-1 bg-transparent px-3 py-3.5 text-white outline-none placeholder:text-white/30" style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px" }} />
        <button onClick={() => { setQuery(""); setOpen((v) => !v); }} className="shrink-0 text-white/30 transition hover:text-white/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border border-t-0 border-white/15 bg-[#1a1a18]">
          {filtered.length > 0 ? filtered.map((loc) => (
            <button key={loc.name} onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(loc.name); setOpen(false); if (loc.map) window.open(loc.map, "_blank"); }} className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-white/30"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <div>
                <p className="font-medium text-white/80" style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px" }}>{loc.name}</p>
                <p className="mt-0.5 text-white/35" style={{ fontFamily: "var(--font-montserrat)", fontSize: "12px" }}>{loc.sub}</p>
              </div>
            </button>
          )) : <p className="px-4 py-4 text-white/30" style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px" }}>Lokasi tidak ditemukan</p>}
        </div>
      )}
    </div>
  );
}
