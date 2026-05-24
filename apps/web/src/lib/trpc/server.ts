import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverApi = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/trpc`,
      transformer: superjson,
    }),
  ],
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

export interface Blog {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  image: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  name: string;
  location: string;
  location_url: string;
  phone_number: string | null;
  position: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Slider {
  id: string;
  legend: string | null;
  title: string;
  description: string;
  image: string;
  action: string | null;
  actionurl: string | null;
  position: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gallery {
  id: string;
  image: string;
  position: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getContent(namespace: string): Promise<Record<string, string>> {
  return serverApi.public.getContent.query({ namespace });
}

export async function getLocations(): Promise<Location[]> {
  return serverApi.public.getLocations.query();
}

export async function getSliders(): Promise<Slider[]> {
  return serverApi.public.getSliders.query();
}

export async function getGalleries(): Promise<Gallery[]> {
  return serverApi.public.getGalleries.query();
}

export async function getBlogPosts(): Promise<Blog[]> {
  return serverApi.public.getBlogPosts.query();
}

export async function getBlogPostsPaginated(page: number, perPage: number): Promise<{ posts: Blog[]; total: number }> {
  return serverApi.public.getBlogPostsPaginated.query({ page, perPage });
}

export async function getBlogPostBySlug(slug: string): Promise<Blog | null> {
  return serverApi.public.getBlogPostBySlug.query({ slug });
}

export async function getRelatedBlogPosts(slug: string): Promise<Blog[]> {
  return serverApi.public.getRelatedBlogPosts.query({ slug });
}
