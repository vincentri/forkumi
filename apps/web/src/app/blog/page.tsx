import Link from "next/link";
import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import { getBlogPostsPaginated, getContent } from "~/lib/trpc/server";

const PER_PAGE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ posts, total }, blogText] = await Promise.all([
    getBlogPostsPaginated(page, PER_PAGE),
    getContent("blog"),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const { blog_legend: legend, blog_title: title } = blogText;

  return (
    <>
      <Navbar solid />
      <main className="min-h-screen bg-[#F9F9F7]">
        <div className="px-6 pb-12 pt-[120px] text-center md:px-16 lg:px-24">
          {legend && <div className="section-label mb-5" dangerouslySetInnerHTML={{ __html: legend }} />}
          {title && (
            <h1
              className="font-serif text-[#1A1A1A]"
              style={{ fontSize: "clamp(36px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
          <div className="mx-auto mt-6 h-px w-10 bg-[#1A1A1A]/15" />
        </div>

        <div className="px-6 pb-[120px] md:px-16 lg:px-24">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const date = post.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-[#E5E5E5]">
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col pt-6">
                      <p
                        className="mb-3 uppercase text-[#1A1A1A]/50"
                        style={{ fontFamily: "var(--font-roboto)", fontSize: "12px", letterSpacing: "1px" }}
                      >
                        {date}
                      </p>
                      <h2
                        className="mb-3 font-serif font-bold text-[#1A1A1A] group-hover:text-[#1A1A1A]/70 transition-colors"
                        style={{ fontSize: "18px", lineHeight: "1.4" }}
                      >
                        {post.title}
                      </h2>
                      <p
                        className="line-clamp-3 flex-1 text-[#737373]"
                        style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px", lineHeight: "1.8" }}
                      >
                        {post.description}
                      </p>
                      <span
                        className="mt-5 inline-flex items-center gap-2 uppercase text-[#1A1A1A] transition-all group-hover:gap-3"
                        style={{ fontFamily: "var(--font-montserrat)", fontSize: "12px", letterSpacing: "1.5px", fontWeight: 600 }}
                      >
                        BACA SELENGKAPNYA
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="py-20 text-center text-[#737373]" style={{ fontFamily: "var(--font-montserrat)", fontSize: "15px" }}>
              Belum ada artikel yang dipublikasikan.
            </p>
          )}

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="flex h-10 w-10 items-center justify-center border border-[#1A1A1A] text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </Link>
              ) : (
                <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center border border-[#1A1A1A]/20 text-[#1A1A1A]/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </span>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/blog?page=${n}`}
                  className="flex h-10 w-10 items-center justify-center border transition"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderColor: "#1A1A1A",
                    background: n === page ? "#1A1A1A" : "transparent",
                    color: n === page ? "#FFFFFF" : "#1A1A1A",
                  }}
                >
                  {n}
                </Link>
              ))}

              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="flex h-10 w-10 items-center justify-center border border-[#1A1A1A] text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              ) : (
                <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center border border-[#1A1A1A]/20 text-[#1A1A1A]/20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
