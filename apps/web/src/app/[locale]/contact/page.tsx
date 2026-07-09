import type { ReactElement } from "react";

import {
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
} from "../../front-page-settings";
import { getPlanOfInterestOptions } from "../../planOfInterest";
import { ContactForm } from "../_components/ContactForm";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

type ContactText = {
  intro: string;
  formHeading: string;
  hoursHeading: string;
  fieldName: string;
  fieldEmail: string;
  fieldPkg: string;
  fieldMessage: string;
  fieldSubmit: string;
  successMessage: string;
  errorMessage: string;
};

const CONTACT_DEFAULTS: Record<"id" | "en", ContactText> = {
  en: {
    intro: "Got a project or question? We reply fast. Pick whatever works for you.",
    formHeading: "Send a quick message",
    hoursHeading: "Working Hours",
    fieldName: "Name",
    fieldEmail: "Email",
    fieldPkg: "Plan of interest",
    fieldMessage: "Message",
    fieldSubmit: "Send via WhatsApp",
    successMessage: "Thanks! We'll get back to you soon.",
    errorMessage: "Could not send — try again later.",
  },
  id: {
    intro: "Punya proyek atau pertanyaan? Kami balas cepat. Pilih cara paling nyaman buatmu.",
    formHeading: "Kirim pesan singkat",
    hoursHeading: "Jam Operasional",
    fieldName: "Nama",
    fieldEmail: "Email",
    fieldPkg: "Paket diminati",
    fieldMessage: "Pesan",
    fieldSubmit: "Kirim via WhatsApp",
    successMessage: "Terima kasih! Kami balas segera.",
    errorMessage: "Gagal mengirim — coba lagi nanti.",
  },
};

const PKG_PLACEHOLDER_EN = "—";
const PKG_PLACEHOLDER_ID = "—";
const SUCCESS_FALLBACK = "Thanks! We'll get back to you soon.";
const ERROR_FALLBACK = "Could not send — try again later.";

export default async function ContactPage({ params }: ContactPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [settings, planOptions] = await Promise.all([
    getFrontPageSettings(locale),
    getPlanOfInterestOptions(locale),
  ]);
  const defaults = CONTACT_DEFAULTS[locale];

  const hl = Number.parseInt(settings.contactH1HighlightIndex ?? "1", 10);
  const h1Line1 = firstValue(settings.contactH1Line1, defaults.intro) ?? defaults.intro;
  const h1Line2 = firstValue(settings.contactH1Line2, defaults.intro) ?? defaults.intro;
  const intro = firstValue(settings.contactIntro, defaults.intro) ?? defaults.intro;
  const formHeading =
    firstValue(settings.contactFormHeading, defaults.formHeading) ?? defaults.formHeading;
  const hoursHeading =
    firstValue(settings.contactHoursHeading, defaults.hoursHeading) ?? defaults.hoursHeading;
  const fieldName =
    firstValue(settings.contactFieldName, defaults.fieldName) ?? defaults.fieldName;
  const fieldEmail =
    firstValue(settings.contactFieldEmail, defaults.fieldEmail) ?? defaults.fieldEmail;
  const fieldPkg =
    firstValue(settings.contactFieldPkg, defaults.fieldPkg) ?? defaults.fieldPkg;
  const fieldMessage =
    firstValue(settings.contactFieldMessage, defaults.fieldMessage) ?? defaults.fieldMessage;
  const fieldSubmit =
    firstValue(settings.contactFieldSubmit, defaults.fieldSubmit) ?? defaults.fieldSubmit;

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "42%", right: "10%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nContact"></span></span>
          <h1>
            <span className={hl === 0 ? "hl" : undefined}>{h1Line1}</span>
            <br />
            <span className={hl === 1 ? "hl" : undefined}>{h1Line2}</span>
          </h1>
          <p>{intro}</p>
        </div>
      </section>

      <section className="sec g-lav">
        <div className="wrap">
          <div className="contact-grid">
            <div className="reveal">
              <div className="cbtns">
                <a className="cbtn wa" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" data-frontpage-contact="whatsapp"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>WhatsApp</b><small>+65 8089 2716</small></div></a>
                <a className="cbtn mail" href="mailto:linkforkumi@gmail.com" data-frontpage-contact="email"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>Email</b><small>linkforkumi@gmail.com</small></div></a>
                <a className="cbtn ig" href="https://www.instagram.com/forkumi.design/" target="_blank" rel="noopener" data-frontpage-contact="instagram"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>Instagram</b><small>@forkumi.design</small></div></a>
                <a className="cbtn ph" href="tel:+6580892716" data-frontpage-contact="phone"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>+65 8089 2716</b><small>Singapore</small></div></a>
                <div className="cbtn" style={{ cursor: "default" }}><span className="ci" style={{ background: "var(--gold)" }}><span className="icon-dot" aria-hidden="true" /></span><div><b>{hoursHeading}</b><small data-frontpage-working-hours></small></div></div>
              </div>
            </div>
            <div className="reveal d1">
              <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "4px" }}>{formHeading}</div>
              <ContactForm
                nameLabel={fieldName}
                emailLabel={fieldEmail}
                pkgLabel={fieldPkg}
                pkgOptions={planOptions.map((option) => option.name)}
                pkgPlaceholder={locale === "id" ? PKG_PLACEHOLDER_ID : PKG_PLACEHOLDER_EN}
                messageLabel={fieldMessage}
                submitLabel={fieldSubmit}
                successMessage={SUCCESS_FALLBACK}
                errorMessage={ERROR_FALLBACK}
              />
            </div>
          </div>
        </div>
      </section>

      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp" data-frontpage-whatsapp><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
