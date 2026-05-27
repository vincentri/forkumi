import Link from "next/link";
import { ReactNode } from "react";

export function ShimmerButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-md border border-slate-900/15 bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
