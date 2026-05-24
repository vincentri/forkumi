import { getContent, getGalleries } from "~/lib/trpc/server";

export default async function PastaCoffeeSection() {
  const [galleryText, video, galleryImages] = await Promise.all([getContent("gallery"), getContent("video"), getGalleries()]);
  const { gallery_legend: legend, gallery_title: title, gallery_ctaLabel: ctaLabel, gallery_ctaUrl: ctaUrl } = galleryText;
  const { video_title: videoTitle, video_url: videoUrl, video_placeholder: videoPlaceholder } = video;

  return (
    <section id="menu" className="bg-[#F9F9F7]">
      <div className="px-6 pb-12 pt-[120px] text-center md:px-16 lg:px-24">
        {legend && <p className="section-label mb-5">{legend}</p>}
        {title && (
          <h2 className="font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }} dangerouslySetInnerHTML={{ __html: title }} />
        )}
        <div className="mx-auto mt-6 h-px w-10 bg-[#1A1A1A]/15" />
      </div>

      {galleryImages.length > 0 && (
        <div className="px-6 md:px-16 lg:px-24">
          <div className="grid grid-cols-[65fr_35fr] gap-[4px]">
            {galleryImages.map((img, i) => (
              <div key={img.id} className={`overflow-hidden ${i === 0 ? "row-span-2" : i === 4 ? "" : "aspect-square"}`}>
                <img src={img.image} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      )}

      {ctaLabel && ctaUrl && (
        <div className="flex justify-center px-6 pt-12 pb-16 md:px-16 lg:px-24">
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#1A1A1A] bg-transparent px-8 py-4 font-sans text-[12px] font-semibold uppercase tracking-[1.5px] text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white">
            {ctaLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </a>
        </div>
      )}

      <div className="mx-auto w-10 h-px bg-[#1A1A1A]/15" />

      <div className="px-6 pb-[120px] pt-16 md:px-16 lg:px-24">
        {videoTitle && (
          <h3 className="mb-5 text-center font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(32px, 3.5vw, 44px)", lineHeight: "1.2", letterSpacing: "-0.01em" }} dangerouslySetInnerHTML={{ __html: videoTitle }} />
        )}
        <div className="relative flex aspect-video items-center justify-center bg-[#1A1A1A]">
          {videoUrl ? (
            <iframe src={videoUrl} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <button className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10" aria-label="Play video">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
          )}
          {videoPlaceholder && !videoUrl && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans font-semibold uppercase text-white/25" style={{ fontSize: "10px", letterSpacing: "3px" }}>{videoPlaceholder}</p>
          )}
        </div>
      </div>
    </section>
  );
}
