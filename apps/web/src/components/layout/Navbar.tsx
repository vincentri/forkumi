"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "TENTANG", href: "#about" },
  { label: "GALERI", href: "#menu" },
  { label: "LOKASI", href: "#lokasi" },
  { label: "BLOG", href: "#blog" },
];

export default function Navbar({ solid, logo }: { solid?: boolean; logo?: string } = {}) {
  const logoSrc = logo || "/Logo White.png";
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLight = solid || scrolled || isOpen;

  return (
    <nav className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${isLight ? "bg-white/95 backdrop-blur-md border-b border-[#EAEAEA]" : "bg-transparent"}`}>
      <div className="flex items-center justify-between px-6 py-4 md:px-16 lg:px-24">
        <Link href="/" className="z-50">
          <Image src={logoSrc} alt="Hoz Pasta" width={110} height={36} className={`h-8 w-auto transition-all duration-300 ${isLight ? "brightness-0" : ""}`} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className={`flex items-center gap-8 font-sans text-[11px] font-semibold tracking-[2px] uppercase ${isLight ? "text-[#1A1A1A]/60" : "text-white/75"}`}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href} className="transition-opacity hover:opacity-100">{label}</a></li>
            ))}
          </ul>
          <Link href="/reservation" className={`font-sans text-[11px] font-semibold px-5 py-3 uppercase tracking-[2px] transition-all duration-300 ${isLight ? "bg-[#1A1A1A] text-white border border-[#1A1A1A] hover:bg-white hover:text-[#1A1A1A]" : "bg-transparent text-white border border-white hover:bg-white hover:text-[#1A1A1A]"}`}>RESERVASI</Link>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="z-50 flex flex-col gap-1.5 md:hidden" aria-label="Toggle menu">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`block h-0.5 w-6 transition-all duration-300 ${isLight ? "bg-[#1A1A1A]" : "bg-white"} ${i === 0 && isOpen ? "translate-y-2 rotate-45" : i === 1 && isOpen ? "opacity-0" : i === 2 && isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          ))}
        </button>

        <div className={`absolute left-0 top-full w-full bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] transition-all duration-300 md:hidden ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
          <ul className="flex flex-col items-center gap-6 px-6 py-8 font-sans text-[11px] font-semibold uppercase tracking-[2px]">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href} onClick={() => setIsOpen(false)} className="text-[#999] transition hover:text-[#1A1A1A]">{label}</a></li>
            ))}
            <li className="mt-2">
              <Link href="/reservation" onClick={() => setIsOpen(false)} className="border border-[#1A1A1A] bg-transparent px-8 py-3 text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white">RESERVASI</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
