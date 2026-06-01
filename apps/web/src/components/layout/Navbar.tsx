"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

const DEFAULT_SITE_LOGO = "/defaults/admin/default-logo-light.png";

interface NavbarProps {
  logo?: string;
  siteName?: string;
  pages?: { slug: string; title: string }[];
}

export default function Navbar({ logo, siteName = "Swepee", pages = [] }: NavbarProps) {
  const logoSrc = logo || DEFAULT_SITE_LOGO;
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent dark:bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src={logoSrc}
                alt="Site logo"
                width={140}
                height={44}
                className="h-9 w-auto object-contain"
                loading="eager"
                fetchPriority="high"
              />
              <span className={`hidden text-xs uppercase tracking-[0.2em] transition-colors duration-300 lg:inline ${
                isScrolled ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
              }`}>
                {siteName}
              </span>
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {pages.map((page, i) => (
                <motion.div
                  key={page.slug}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`/${page.slug}`}
                    className="group relative px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:text-slate-950 dark:hover:text-slate-100"
                  >
                    <span className="relative z-10">{page.title}</span>
                    <motion.span
                      className="absolute inset-0 rounded-lg bg-sky-50 dark:bg-slate-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      layoutId="nav-bg"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm transition-colors hover:bg-white dark:hover:bg-slate-900"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="size-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                ) : (
                  <svg className="size-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.header>
    </>
  );
}
