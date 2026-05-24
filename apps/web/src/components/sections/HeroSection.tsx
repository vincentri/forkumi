import { getSliders } from "~/lib/trpc/server";
import HeroCarousel from "./HeroCarousel";

export default async function HeroSection() {
  const rows = await getSliders();
  const slides = rows.map((r) => ({
    image: r.image,
    tag: r.legend ?? undefined,
    title: r.title,
    subtitle: r.description,
    ctaLabel: r.action ?? undefined,
    ctaUrl: r.actionurl ?? undefined,
  }));

  return <HeroCarousel slides={slides} />;
}
