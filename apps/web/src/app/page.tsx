import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import { getContent } from "~/lib/trpc/server";
import { resolveWhatsAppHref } from "~/lib/whatsapp";
import { Marquee } from "~/components/magicui/Marquee";
import { ShimmerButton } from "~/components/magicui/ShimmerButton";

export default async function Home() {
  const [general, contact] = await Promise.all([getContent("general"), getContent("contact")]);
  const siteName = general.site_name || "Quantyx";
  const whatsAppHref = resolveWhatsAppHref(contact.whatsapp || "", contact.whatsapp_message || "") ?? "#contact";
  const hasWhatsApp = whatsAppHref !== "#contact";
  const stacks = [
    "Next.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "tRPC",
    "Tailwind CSS",
    "Vercel",
  ];

  return (
    <>
      <Navbar />
      <main className="bg-white text-slate-900">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(59,130,246,0.16),transparent_46%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.12),transparent_44%),linear-gradient(180deg,#ffffff_0%,#f8fbff_60%,#ffffff_100%)]" />
          <div className="relative mx-auto flex min-h-[82vh] max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-700">
              {siteName}
            </div>
            <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[1.05] text-slate-950 md:text-7xl">
              Product engineering with a modern edge and enterprise reliability.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-slate-600 md:text-lg">
              We help ambitious teams launch faster with polished UX, resilient architecture, and pragmatic execution from first scope to stable release.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ShimmerButton href={whatsAppHref}>{hasWhatsApp ? "Chat on WhatsApp" : "Contact Us"}</ShimmerButton>
              <a
                href="#services"
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Explore Services
              </a>
            </div>
            <div className="mt-14 grid gap-3 sm:grid-cols-3">
              {[
                ["100%", "Transparent delivery rhythm"],
                ["Senior", "Hands-on engineering leadership"],
                ["Modern", "Design and architecture standards"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-slate-900">{k}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">Services</h2>
            <p className="max-w-md text-sm text-slate-600">Built for teams that need speed, clarity, and engineering depth in one place.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              ["Product Engineering", "Web platforms from concept to production with scalable foundations and clean DX.", "md:col-span-3"],
              ["Platform Modernization", "Refactor legacy systems into maintainable, high-performing delivery machines.", "md:col-span-2"],
              ["Team Augmentation", "Drop-in senior contributors for roadmap-critical execution and technical leadership.", "md:col-span-5"],
            ].map(([title, body, span], index) => (
              <article
                key={title}
                className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-sky-300/60 hover:bg-sky-50 ${span}`}
                style={{ animation: `floatY ${6 + index}s ease-in-out infinite`, animationDelay: `${index * 0.2}s` }}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-300/10 blur-2xl transition group-hover:bg-sky-300/20" />
                <h3 className="relative text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">How We Work</h2>
          <div className="relative mt-8 grid gap-4 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[10px] top-2 hidden h-[94%] w-px overflow-hidden bg-slate-200 md:block">
              <span className="absolute h-1/3 w-px bg-sky-300" style={{ animation: "beamFlow 4s linear infinite" }} />
            </div>
            {[
              ["1", "Discover", "Clarify scope, constraints, and measurable outcomes."],
              ["2", "Build", "Ship in milestones with transparent communication and demos."],
              ["3", "Scale", "Harden quality, optimize performance, and support growth."],
            ].map(([num, title, body]) => (
              <article key={title} className="relative rounded-xl border border-slate-200 bg-white p-6 transition hover:border-sky-300/45 hover:bg-sky-50">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-200 md:pl-5">{num}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">Capability Proof</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-12">
            {[
              ["Faster Delivery", "Structured sprint plans and production-ready increments.", "md:col-span-4"],
              ["Stable Releases", "Code reviews, type safety, and predictable deployment flow.", "md:col-span-4"],
              ["Business Alignment", "Engineering decisions tied directly to product goals.", "md:col-span-4"],
            ].map(([title, body, span], index) => (
              <article
                key={title}
                className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${span}`}
                style={{ animation: `pulseGlow ${3.8 + index}s ease-in-out infinite`, animationDelay: `${index * 0.25}s` }}
              >
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">Tech Stack</h2>
          <div className="mt-8 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <Marquee
              items={stacks.map((item) => (
                <span key={item} className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-700">
                  {item}
                </span>
              ))}
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">What Teams Value</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Clear communication and realistic commitments from day one.",
              "Engineering depth without overcomplicating product decisions.",
              "Delivery quality that supports long-term product confidence.",
              "Ownership mindset from planning through launch.",
            ].map((quote, index) => (
              <blockquote
                key={quote}
                className="group rounded-xl border border-slate-200 bg-white p-6 text-slate-700 transition duration-500 hover:-translate-y-1 hover:border-sky-300/45 hover:bg-sky-50"
                style={{ animation: `floatY ${6.5 + index * 0.4}s ease-in-out infinite`, animationDelay: `${index * 0.3}s` }}
              >
                <p className="text-base leading-7">{quote}</p>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              ["Do you handle end-to-end delivery?", "Yes, from discovery and UX to deployment and maintenance."],
              ["Can you work with an existing team?", "Yes, we can integrate with your team and current workflow."],
              ["What project size is ideal?", "Most engagements start from focused MVPs to full product modernization."],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-slate-200 bg-white p-6 open:border-sky-300/60 open:bg-sky-50">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">{q}</summary>
                <p className="mt-3 text-sm text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="rounded-xl border border-sky-200 bg-[linear-gradient(120deg,#f8fbff,#eef6ff)] p-8 text-slate-900 md:p-10">
            <h2 className="text-3xl font-semibold md:text-4xl">Let&apos;s Build Your Next Product</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Share your scope and timeline. We will reply with a practical plan and recommended starting path.
            </p>
            <div className="mt-8">
              <a
                href={whatsAppHref}
                className="inline-flex rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {hasWhatsApp ? "Chat on WhatsApp" : "Contact Us"}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
