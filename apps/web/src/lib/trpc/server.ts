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

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getContent(namespace: string): Promise<Record<string, string>> {
  return serverApi.public.getContent.query({ namespace });
}

export async function getPages(): Promise<Page[]> {
  return serverApi.public.getPages.query();
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return serverApi.public.getPageBySlug.query({ slug });
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
