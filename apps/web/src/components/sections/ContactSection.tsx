import { getContent } from "~/lib/trpc/server";
import ContactForm from "./ContactForm";

export default async function ContactSection() {
  const contact = await getContent("contact");
  const waNumber = contact.contact_number ?? "";

  return (
    <section id="contact" className="bg-white px-6 py-[120px] md:px-16 lg:px-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-16 text-center">
          <p className="section-label mb-5">HUBUNGI KAMI</p>
          <h2 className="font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}>
            <strong className="font-bold">Kontak</strong>{" "}<em className="font-normal" style={{ fontStyle: "italic" }}>Kami</em>
          </h2>
        </div>
        <ContactForm waNumber={waNumber} />
      </div>
    </section>
  );
}
