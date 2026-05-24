"use client";

import { useState } from "react";
import Link from "next/link";
type Post = { slug: string; image: string | null; title: string; date: string };

export default function RelatedArticlesCarousel({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  if (posts.length === 0) return null;

  const perPage = 3;
  const maxIndex = Math.max(0, posts.length - perPage);
  const visible = posts.slice(index, index + perPage);

  return (
    <div>
      <div className="relative flex items-center gap-4">
        <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous articles" className="shrink-0 p-2 text-[#1A1A1A]/30 transition hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="grid flex-1 gap-8 md:grid-cols-3">
          {visible.map((rel) => (
            <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group">
              {rel.image && <div className="aspect-[4/3] overflow-hidden"><img src={rel.image} alt={rel.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
              <p className="mt-5 uppercase" style={{ fontFamily: "var(--font-roboto)", fontSize: "12px", color: "#666666", letterSpacing: "1px" }}>{rel.date}</p>
              <h3 className="mt-2 font-serif font-bold text-[#1A1A1A] transition-colors group-hover:text-[#1A1A1A]/60" style={{ fontSize: "22px", lineHeight: "1.4" }}>{rel.title}</h3>
              <span className="mt-4 inline-flex items-center gap-2 font-sans font-normal uppercase text-[#1A1A1A] transition-all group-hover:gap-3" style={{ fontSize: "12px", letterSpacing: "1.5px" }}>
                BACA SELENGKAPNYA
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </Link>
          ))}
        </div>
        <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} aria-label="Next articles" className="shrink-0 p-2 text-[#1A1A1A]/30 transition hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
      {posts.length > perPage && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to page ${i + 1}`} className="h-[2px] transition-all" style={{ width: i === index ? "32px" : "16px", background: i === index ? "#1A1A1A" : "#1A1A1A40" }} />
          ))}
        </div>
      )}
    </div>
  );
}
