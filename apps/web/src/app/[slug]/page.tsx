import { notFound } from "next/navigation";
import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import { getPageBySlug } from "~/lib/trpc/server";

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <article className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{page.title}</h1>
          <div
            className="prose prose-slate mt-10 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
