"use client";

import { useState } from "react";
import Link from "next/link";

type Post = { slug: string; title: string; date: string; image: string | null; description: string };

const PER_PAGE = 3;

export default function BlogSection({ legend, title, posts }: { legend?: string; title?: string; posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, posts.length - PER_PAGE);
  const visible = posts.slice(index, index + PER_PAGE);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="bg-[#F9F9F7] px-6 py-[120px] md:px-16 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          {legend && <div className="section-label mb-5" dangerouslySetInnerHTML={{ __html: legend }} />}
          {title && <h2 className="font-serif text-[#1A1A1A]" style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }} dangerouslySetInnerHTML={{ __html: title }} />}
        </div>

        <div className="relative flex items-center gap-4">
          {maxIndex > 0 && (
            <button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous" className="shrink-0 p-2 text-[#1A1A1A]/30 transition hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <div className="grid flex-1 gap-10 md:grid-cols-3">
            {visible.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                {post.image && <div className="aspect-[4/3] overflow-hidden"><img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
                <p className="mt-6 uppercase" style={{ fontFamily: "var(--font-roboto)", fontSize: "12px", color: "#666666", letterSpacing: "1px" }}>{post.date}</p>
                <h3 className="mt-2 font-serif font-bold text-[#1A1A1A] transition-colors group-hover:text-[#1A1A1A]/60" style={{ fontSize: "18px", lineHeight: "1.4" }}>{post.title}</h3>
                <p className="mt-3 line-clamp-3" style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px", color: "#737373", lineHeight: "22.8px" }}>{post.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-sans font-normal uppercase text-[#1A1A1A] transition-all group-hover:gap-3" style={{ fontSize: "12px", letterSpacing: "1.5px" }}>
                  BACA SELENGKAPNYA
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </Link>
            ))}
          </div>
          {maxIndex > 0 && (
            <button onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))} disabled={index >= maxIndex} aria-label="Next" className="shrink-0 p-2 text-[#1A1A1A]/30 transition hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          )}
        </div>

        {maxIndex > 0 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Go to position ${i + 1}`} className="h-[2px] transition-all" style={{ width: i === index ? "32px" : "16px", background: i === index ? "#1A1A1A" : "#1A1A1A40" }} />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link href="/blog" className="inline-flex items-center gap-2 border border-[#1A1A1A] bg-transparent px-8 py-4 font-sans font-semibold uppercase text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white" style={{ fontSize: "12px", letterSpacing: "1.5px" }}>
            LIHAT SEMUA ARTIKEL
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
