import Link from "next/link";
import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import { getBlogPostsPaginated } from "~/lib/trpc/server";
import { resolveApiPublicUrl } from "~/lib/public-url";

const PER_PAGE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const { posts, total } = await getBlogPostsPaginated(page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Blog</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Latest posts</h1>
            <p className="mt-4 text-slate-600">Published articles from your admin-managed blog.</p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const date = post.createdAt.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });
                const imageSrc = resolveApiPublicUrl(post.image);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="aspect-[4/3] bg-slate-100">
                      {imageSrc && (
                        <img
                          src={imageSrc}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-sm text-slate-400">{date}</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-950 transition group-hover:text-slate-600">{post.title}</h2>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{post.description}</p>
                      <span className="mt-6 text-sm font-medium text-slate-950">Read post</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No published posts yet.
            </p>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Prev
                </Link>
              ) : (
                <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 text-slate-300">Prev</span>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/blog?page=${n}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
                    n === page ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 text-slate-700 hover:border-slate-950"
                  }`}
                >
                  {n}
                </Link>
              ))}

              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Next
                </Link>
              ) : (
                <span className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 text-slate-300">Next</span>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
