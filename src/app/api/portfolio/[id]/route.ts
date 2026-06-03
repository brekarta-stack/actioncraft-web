import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getItemById, saveItem, deleteItem } from "@/lib/portfolio";
import { slugify } from "@/lib/portfolio-meta";

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
  // slug 가 들어오면 slugify, 빈 문자열이면 기존 slug 유지
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugify(body.slug)
      : item.slug;
  const updated = { ...item, ...body, id, slug, updatedAt: new Date().toISOString() };
  await saveItem(updated);

  // 변경 즉시 메인·포트폴리오·상세 페이지 갱신
  revalidatePath("/");
  revalidatePath("/portfolio");
  if (item.slug) revalidatePath(`/portfolio/${item.slug}`);
  if (updated.slug && updated.slug !== item.slug) revalidatePath(`/portfolio/${updated.slug}`);

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

  revalidatePath("/");
  revalidatePath("/portfolio");
  if (item.slug) revalidatePath(`/portfolio/${item.slug}`);

  return NextResponse.json({ ok: true });
}
