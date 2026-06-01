import Link from "next/link";
import Image from "next/image";
import { resolveApiPublicUrl } from "~/lib/public-url";

const DEFAULT_SITE_LOGO = "/defaults/admin/default-logo-light.png";

export default function Footer({ siteName = "Swepee", logo }: { siteName?: string; logo?: string }) {
  const logoSrc = resolveApiPublicUrl(logo || DEFAULT_SITE_LOGO);

  return (
    <footer className="relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      {/* Animated gradient top border */}
      <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
        <div
          className="h-full w-full"
          style={{
            background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #38bdf8)",
            backgroundSize: "300% 100%",
            animation: "gradientSlide 6s linear infinite",
          }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        {/* Logo + tagline */}
        <Link href="/" className="flex items-center gap-3">
          <Image src={logoSrc} alt="Site logo" width={120} height={38} className="h-8 w-auto object-contain" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">{siteName}</span>
        </Link>

        {/* Copyright only */}
        <div className="text-sm text-slate-400 dark:text-slate-600">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        @keyframes gradientSlide {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </footer>
  );
}
