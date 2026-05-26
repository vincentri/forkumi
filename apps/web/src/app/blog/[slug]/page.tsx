import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug, getRelatedBlogPosts } from "~/lib/trpc/server";
import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import { resolveApiPublicUrl } from "~/lib/public-url";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(slug);
  const date = post.createdAt.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });
  const imageSrc = resolveApiPublicUrl(post.image);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/blog" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
            Back to blog
          </Link>
          <p className="mt-10 text-sm text-slate-400">{date}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{post.title}</h1>
          {imageSrc && (
            <img src={imageSrc} alt={post.title} className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}
          <div
            className="prose prose-slate mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {related.length > 0 && (
          <section className="border-t border-slate-200 bg-slate-50 px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">More posts</h2>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300">
                    <p className="text-sm text-slate-400">
                      {item.createdAt.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
