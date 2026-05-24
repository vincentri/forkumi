import { getContent } from "~/lib/trpc/server";

export default async function AboutSection() {
  const data = await getContent("about");
  const { about_legend: legend, about_photo: photo, about_title: title, about_body: body, about_ctaLabel: ctaLabel, about_ctaUrl: ctaUrl } = data;

  return (
    <section id="about" className="section-padding bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20 lg:gap-28">
        {photo && (
          <div className="aspect-[3/4] overflow-hidden">
            <img src={photo} alt="Chef - Hoz Pasta" className="h-full w-full object-cover object-top" />
          </div>
        )}
        <div className="flex flex-col">
          {legend && <p className="section-label">{legend}</p>}
          {title && <h2 className="mt-5 font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }} dangerouslySetInnerHTML={{ __html: title }} />}
          <div className="mt-6 h-px w-10 bg-[#1A1A1A]/15" />
          {body && <div className="mt-7" style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px", color: "#737373", lineHeight: "22.8px" }} dangerouslySetInnerHTML={{ __html: body }} />}
          {ctaLabel && ctaUrl && (
            <div className="mt-10">
              <a href={ctaUrl} className="btn-outline inline-block">{ctaLabel}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
