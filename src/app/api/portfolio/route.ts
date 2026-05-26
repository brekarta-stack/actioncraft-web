import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getItems, saveItem } from "@/lib/portfolio";
import type { PortfolioItem } from "@/lib/portfolio";
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

  const newItem: PortfolioItem = {
    id: randomUUID(),
    airtableId: body.airtableId,
    title: body.title ?? "",
    category: body.category ?? "기타",
    description: body.description ?? "",
    client: body.client ?? "",
    images: body.images ?? [],
    published: body.published ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await saveItem(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
