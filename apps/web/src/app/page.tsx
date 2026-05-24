import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";

export default async function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-slate-50">
        <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">Default Template</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            Your new site starts here.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
            This is a clean starter homepage. Add custom pages and blog posts from the admin panel to shape the public site.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
