import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getItemById, saveItem, deleteItem } from "@/lib/portfolio";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // 비공개 아이템은 어드민만 접근 가능
  if (!item.published && !session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updated = { ...item, ...body, id, updatedAt: new Date().toISOString() };
  await saveItem(updated);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItemById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteItem(id);
  return NextResponse.json({ ok: true });
}
