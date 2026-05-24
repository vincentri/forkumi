import Link from "next/link";
import Image from "next/image";
import ScrollTopButton from "./ScrollTopButton";
import { getContent } from "~/lib/trpc/server";

export default async function Footer() {
  const data = await getContent("general");

  const { logo, description, phone, email, opening_hours_day: hoursDay, opening_hours_time: hoursTime } = data;
  const logoSrc = logo || "/Logo White.png";

  return (
    <footer className="bg-[#1A1A1A] px-6 pt-14 pb-0 text-white md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 pb-12 md:grid-cols-3">
          <div>
            <Link href="/"><Image src={logoSrc} alt="Hoz Pasta" width={110} height={36} className="h-9 w-auto" /></Link>
            {description && <p className="mt-3 text-sm" style={{ color: "#A0A0A0", fontFamily: "var(--font-roboto)" }}>{description}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px]" style={{ color: "#A0A0A0", fontFamily: "var(--font-montserrat)" }}>KONTAK</p>
            <ul className="mt-4 flex flex-col gap-3">
              {phone && (
                <li className="flex items-center gap-3 text-sm" style={{ color: "#A0A0A0" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: "#666666" }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03z" /></svg>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="transition hover:text-white">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3 text-sm" style={{ color: "#A0A0A0" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: "#666666" }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                  <a href={`mailto:${email}`} className="transition hover:text-white">{email}</a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px]" style={{ color: "#A0A0A0", fontFamily: "var(--font-montserrat)" }}>JAM BUKA</p>
            <ul className="mt-4 flex flex-col gap-3">
              {hoursDay && (
                <li className="flex items-center gap-3 text-sm" style={{ color: "#A0A0A0" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: "#666666" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {hoursDay}
                </li>
              )}
              {hoursTime && (
                <li className="flex items-center gap-3 text-sm" style={{ color: "#A0A0A0" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: "#666666" }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  {hoursTime}
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="relative flex items-center justify-center border-t py-5" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-roboto)" }}>&copy; 2026 HOZ Pasta. Hak cipta dilindungi.</p>
          <ScrollTopButton />
        </div>
      </div>
    </footer>
  );
}
