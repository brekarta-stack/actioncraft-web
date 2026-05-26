import { NextResponse } from "next/server";
import {
  getItemByAirtableId,
  saveItem,
  deleteItemByAirtableId,
} from "@/lib/portfolio";
import { supabase } from "@/lib/supabase";
import type { PortfolioItem } from "@/lib/portfolio-types";
import { CATEGORIES } from "@/lib/portfolio-types";
import { randomUUID } from "crypto";
import path from "path";

const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET;

interface AirtableImage {
  url: string;
  filename: string;
}

interface AirtablePayload {
  secret?: string;
  action: "create" | "update" | "delete";
  record: {
    id: string;
    title?: string;
    category?: string;
    description?: string;
    client?: string;
    published?: boolean;
    images?: AirtableImage[];
  };
}

async function uploadImageToStorage(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const ext = path.extname(filename) || ".jpg";
  const name = `airtable_${randomUUID()}${ext}`;

  const { error } = await supabase.storage
    .from("uploads")
    .upload(name, buffer, { contentType: res.headers.get("content-type") ?? "image/jpeg" });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(name);
  return publicUrl;
}

export async function POST(request: Request) {
  if (WEBHOOK_SECRET) {
    const authHeader = request.headers.get("x-webhook-secret");
    const body = await request.clone().json().catch(() => null) as AirtablePayload | null;
    if (authHeader !== WEBHOOK_SECRET && body?.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: AirtablePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, record } = payload;
  if (!record?.id) {
    return NextResponse.json({ error: "Missing record.id" }, { status: 400 });
  }

  if (action === "delete") {
    await deleteItemByAirtableId(record.id);
    return NextResponse.json({ ok: true, action: "deleted", airtableId: record.id });
  }

  const uploadedImages: string[] = [];
  for (const img of record.images ?? []) {
    try {
      uploadedImages.push(await uploadImageToStorage(img.url, img.filename));
    } catch (e) {
      console.error("Image upload failed:", img.url, e);
    }
  }

  const rawCategory = record.category ?? "기타";
  const category = (CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as PortfolioItem["category"])
    : "기타";

  const now = new Date().toISOString();
  const existing = await getItemByAirtableId(record.id);

  const item: PortfolioItem = {
    id: existing?.id ?? randomUUID(),
    airtableId: record.id,
    title: record.title ?? existing?.title ?? "",
    category,
    description: record.description ?? existing?.description ?? "",
    client: record.client ?? existing?.client ?? "",
    images: uploadedImages.length > 0 ? uploadedImages : (existing?.images ?? []),
    published: record.published ?? existing?.published ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await saveItem(item);
  return NextResponse.json({ ok: true, action, airtableId: record.id });
}
