import Link from "next/link";
import Image from "next/image";
import ReservationForm from "~/components/reservation/ReservationForm";
import Footer from "~/components/layout/Footer";
import { getLocations, getContent } from "~/lib/trpc/server";

export default async function ReservationPage() {
  const [rows, contact, general] = await Promise.all([getLocations(), getContent("contact"), getContent("general")]);
  const defaultWaNumber = contact.contact_number ?? "";
  const logoSrc = general.logo || "/Logo White.png";
  const locations = rows.map((r) => ({ name: r.name, sub: r.location, waNumber: r.phone_number ?? undefined }));
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Minimal header */}
        <header className="flex items-center justify-between px-6 py-6 md:px-16 lg:px-24">
          <Link href="/">
            <Image src={logoSrc} alt="Hoz Pasta" width={110} height={36} className="h-8 w-auto brightness-0" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 font-sans font-normal uppercase text-[#1A1A1A] transition-all hover:gap-3" style={{ fontSize: "12px", letterSpacing: "1.5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            KEMBALI
          </Link>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-2xl px-6 py-16 md:px-0">
          <div className="mb-12 text-center">
            <p className="section-label mb-5">RESERVASI</p>
            <h1 className="font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(36px, 4vw, 52px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}>
              <strong className="font-bold">Pesan</strong>{" "}<em className="font-normal" style={{ fontStyle: "italic" }}>Meja</em>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-center text-[#737373]" style={{ fontFamily: "var(--font-montserrat)", fontSize: "15px", lineHeight: "1.7" }}>
              Isi formulir di bawah dan konfirmasi reservasi Anda melalui WhatsApp. Kami akan segera merespons.
            </p>
          </div>
          <ReservationForm locations={locations} defaultWaNumber={defaultWaNumber} />
        </div>
      </main>
      <Footer />
    </>
  );
}
