import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPosts, savePost, generateSlug } from "@/lib/blog";
import type { Post } from "@/lib/blog";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();
  const visible = session ? posts : posts.filter((p) => p.published);
  return NextResponse.json(visible);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const now = new Date().toISOString();
  // 게시일 지정 가능 (노출 순서 기준) — 유효한 날짜 문자열이 아니면 현재 시각
  const createdAt =
    typeof body.createdAt === "string" && !Number.isNaN(Date.parse(body.createdAt))
      ? body.createdAt
      : now;

  const newPost: Post = {
    id: randomUUID(),
    slug: generateSlug(body.title ?? "untitled"),
    title: body.title ?? "",
    excerpt: body.excerpt ?? "",
    content: body.content ?? "",
    tag: body.tag ?? "",
    emoji: body.emoji ?? "📝",
    coverImage: body.coverImage,
    published: body.published ?? false,
    createdAt,
    updatedAt: now,
  };

  await savePost(newPost);
  return NextResponse.json(newPost, { status: 201 });
}
