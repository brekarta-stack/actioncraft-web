import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPostById, savePost, deletePost } from "@/lib/blog";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // 비공개 글은 어드민만 접근 가능
  if (!post.published && !session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = { ...post, ...body, id, updatedAt: new Date().toISOString() };
  await savePost(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deletePost(id);
  return NextResponse.json({ ok: true });
}
