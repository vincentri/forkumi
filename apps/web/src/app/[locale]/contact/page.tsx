import type { ReactElement } from "react";

import {
  EMAIL_FALLBACK,
  INSTAGRAM_FALLBACK,
  PHONE_FALLBACK,
  WHATSAPP_FALLBACK,
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  safeHref,
} from "../../front-page-settings";
import { getPlanOfInterestOptions } from "../../planOfInterest";
import { ContactForm } from "../_components/ContactForm";
import { Breadcrumb } from "../_components/Breadcrumb";
import { Fab } from "../_components/Fab";

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
  const successMessage =
    firstValue(settings.contactSuccessMessage, defaults.successMessage) ?? defaults.successMessage;
  const errorMessage =
    firstValue(settings.contactErrorMessage, defaults.errorMessage) ?? defaults.errorMessage;

  const whatsappUrl = safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK);
  const whatsappLabel = "WhatsApp";
  const phoneUrl = safeHref(settings.contactPhoneUrl, PHONE_FALLBACK);
  const phoneLabel = firstValue(settings.contactPhoneLabel) ?? "+65 8089 2716";
  const emailUrl = safeHref(settings.contactEmailUrl, EMAIL_FALLBACK);
  const emailLabel = firstValue(settings.contactEmailLabel) ?? "linkforkumi@gmail.com";
  const instagramUrl = safeHref(settings.contactInstagramUrl, INSTAGRAM_FALLBACK);
  const instagramLabel = firstValue(settings.contactInstagramLabel) ?? "@forkumi.design";
  const workingHours =
    firstValue(settings.contactWorkingHours) ??
    (locale === "id" ? "Senin – Jumat · 09.00 – 18.00 WIB" : "Mon – Fri · 09:00 – 18:00 GMT+7");
  const PAGE_LABEL: Record<"id" | "en", string> = { id: "Kontak", en: "Contact" };

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "42%", right: "10%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <Breadcrumb locale={locale} current={PAGE_LABEL[locale]} />
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
                <a className="cbtn wa" href={whatsappUrl} target="_blank" rel="noopener"><span className="ci"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></span><div><b>{whatsappLabel}</b><small>{phoneLabel}</small></div></a>
                <a className="cbtn mail" href={emailUrl}><span className="ci"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg></span><div><b>Email</b><small>{emailLabel}</small></div></a>
                <a className="cbtn ig" href={instagramUrl} target="_blank" rel="noopener"><span className="ci"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg></span><div><b>Instagram</b><small>{instagramLabel}</small></div></a>
                <a className="cbtn ph" href={phoneUrl}><span className="ci"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg></span><div><b>{phoneLabel}</b><small>Singapore</small></div></a>
                <div className="cbtn" style={{ cursor: "default" }}><span className="ci" style={{ background: "var(--gold)" }}><svg viewBox="0 0 24 24" style={{ stroke: "var(--navy)" }}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><div><b>{hoursHeading}</b><small>{workingHours}</small></div></div>
              </div>
            </div>
            <div className="reveal d1">
              <ContactForm
                formHeading={formHeading}
                nameLabel={fieldName}
                emailLabel={fieldEmail}
                pkgLabel={fieldPkg}
                pkgOptions={planOptions.map((option) => option.name)}
                pkgPlaceholder={locale === "id" ? PKG_PLACEHOLDER_ID : PKG_PLACEHOLDER_EN}
                messageLabel={fieldMessage}
                submitLabel={fieldSubmit}
                successMessage={successMessage}
                errorMessage={errorMessage}
              />
            </div>
          </div>
        </div>
      </section>

      <Fab href={whatsappUrl} />
    </>
  );
}
