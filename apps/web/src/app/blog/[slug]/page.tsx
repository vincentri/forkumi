import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getRelatedBlogPosts, getBlogPosts } from "~/lib/trpc/server";
import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import RelatedArticlesCarousel from "~/components/blog/RelatedArticlesCarousel";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const relatedRaw = await getRelatedBlogPosts(slug);
  const related = relatedRaw.map((p) => ({
    slug: p.slug,
    image: p.image,
    title: p.title,
    date: p.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
  }));

  const date = post.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Navbar />

      {/* Hero: 60vh, text bottom-left aligned */}
      <section className="relative overflow-hidden" style={{ height: "60vh", minHeight: "420px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: post.image ? `url('${post.image}')` : undefined }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-12 md:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-[720px]">
            <p
              className="font-sans font-semibold uppercase text-white/60"
              style={{ fontSize: "12px", letterSpacing: "2px" }}
            >
              {date.toUpperCase()}
            </p>
            <h1
              className="mt-4 font-serif text-white"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}
            >
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article body */}
      <main className="bg-white px-6 py-20 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[720px]">
          <div
            className="blog-content"
            style={{ fontFamily: "var(--font-montserrat)", fontSize: "14px", color: "#737373", lineHeight: "22.8px" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back link */}
          <div className="mt-16 border-t pt-8" style={{ borderColor: "#E5E5E5" }}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-sans font-bold uppercase text-[#1A1A1A]/50 transition hover:text-[#1A1A1A]"
              style={{ fontSize: "12px", letterSpacing: "1.5px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              SEMUA ARTIKEL
            </Link>
          </div>
        </div>
      </main>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-[#F9F9F7] px-6 py-20 md:px-16 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <p
              className="text-center font-sans font-semibold uppercase text-[#1A1A1A]/40"
              style={{ fontSize: "12px", letterSpacing: "2px" }}
            >
              BACA JUGA
            </p>
            <h2
              className="mt-4 text-center font-serif text-[#1A1A1A]"
              style={{ fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: "1.2", letterSpacing: "-0.01em" }}
            >
              <strong className="font-bold">Artikel</strong>{" "}
              <em className="font-normal" style={{ fontStyle: "italic" }}>Lainnya</em>
            </h2>
            <div className="mt-12">
              <RelatedArticlesCarousel posts={related} />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
