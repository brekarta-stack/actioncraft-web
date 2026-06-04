import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getItems, saveItem } from "@/lib/portfolio";
import type { PortfolioItem } from "@/lib/portfolio";
import { deriveSlug, slugify } from "@/lib/portfolio-meta";
import { randomUUID } from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  const items = await getItems();
  const visible = session ? items : items.filter((i) => i.published);
  return NextResponse.json(visible);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const now = new Date().toISOString();
  const id = randomUUID();

  // slug 자동 생성 (명시된 값 우선)
  const requestedSlug = typeof body.slug === "string" ? slugify(body.slug) : "";
  const slug =
    requestedSlug ||
    deriveSlug({ id, slug: "", client: body.client ?? "", title: body.title ?? "" });

  const newItem: PortfolioItem = {
    id,
    airtableId: body.airtableId,
    slug,
    title: body.title ?? "",
    summary: typeof body.summary === "string" ? body.summary : undefined,
    category: body.category ?? "팝업북",
    description: body.description ?? "",
    client: body.client ?? "",
    clientType: typeof body.clientType === "string" ? body.clientType : undefined,
    tags: Array.isArray(body.tags)
      ? body.tags.filter((t: unknown): t is string => typeof t === "string")
      : [],
    keywords: Array.isArray(body.keywords)
      ? body.keywords.filter((k: unknown): k is string => typeof k === "string")
      : [],
    images: body.images ?? [],
    imageAlts: Array.isArray(body.imageAlts) ? body.imageAlts : [],
    published: body.published ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await saveItem(newItem);

  // 발행된 사례면 메인·포트폴리오·상세 페이지 즉시 갱신
  if (newItem.published) {
    revalidatePath("/");
    revalidatePath("/portfolio");
    revalidatePath(`/portfolio/${newItem.slug}`);
  }

  return NextResponse.json(newItem, { status: 201 });
}
