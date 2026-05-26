import { supabase } from "./supabase";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  emoji: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPost(row: any): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    tag: row.tag,
    emoji: row.emoji,
    coverImage: row.cover_image ?? undefined,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toPost);
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  return data ? toPost(data) : undefined;
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? toPost(data) : undefined;
}

export async function savePost(post: Post): Promise<void> {
  const { error } = await supabase.from("posts").upsert({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tag: post.tag,
    emoji: post.emoji,
    cover_image: post.coverImage ?? null,
    published: post.published,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  });
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "post"
  );
}
