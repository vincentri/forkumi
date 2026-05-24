import Navbar from "~/components/layout/NavbarServer";
import Footer from "~/components/layout/Footer";
import HeroSection from "~/components/sections/HeroSection";
import AboutSection from "~/components/sections/AboutSection";
import PastaCoffeeSection from "~/components/sections/PastaCoffeeSection";
import SubscribeSection from "~/components/sections/SubscribeSection";
import BlogSection from "~/components/sections/BlogSection";
import ContactSection from "~/components/sections/ContactSection";
import { getContent, getBlogPosts } from "~/lib/trpc/server";

export default async function Home() {
  const [blog, posts] = await Promise.all([getContent("blog"), getBlogPosts()]);

  const blogPosts = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    image: p.image,
    description: p.description,
  }));

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <PastaCoffeeSection />
        <SubscribeSection />
        <BlogSection legend={blog.blog_legend} title={blog.blog_title} posts={blogPosts} />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
