import { supabaseAdmin } from "./supabase-admin";
export type { Category, ClientType, PortfolioItem } from "./portfolio-types";
export { CATEGORIES, CLIENT_TYPES, SUGGESTED_TAGS } from "./portfolio-types";
import type { PortfolioItem } from "./portfolio-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toItem(row: any): PortfolioItem {
  return {
    id: row.id,
    airtableId: row.airtable_id ?? undefined,
    slug: row.slug ?? undefined,
    title: row.title,
    summary: row.summary ?? undefined,
    category: row.category,
    description: row.description,
    client: row.client,
    clientType: row.client_type ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    images: row.images ?? [],
    imageAlts: Array.isArray(row.image_alts) ? row.image_alts : [],
    published: row.published,
    featured: row.featured ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getItems(): Promise<PortfolioItem[]> {
  const { data, error } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toItem);
}

export async function getItemById(id: string): Promise<PortfolioItem | undefined> {
  const { data } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? toItem(data) : undefined;
}

/**
 * Slug 로 항목 조회. slug 가 비어있는 레거시 항목은 case-{id 앞 8자} fallback 으로도 시도.
 */
export async function getItemBySlug(slug: string): Promise<PortfolioItem | undefined> {
  const { data: bySlug } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (bySlug) return toItem(bySlug);

  const m = slug.match(/^case-([a-f0-9]{8})$/i);
  if (m) {
    const idPrefix = m[1];
    const { data: all } = await supabaseAdmin.from("portfolio_items").select("*");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = (all ?? []).find((r: any) => r.id?.startsWith(idPrefix));
    if (found) return toItem(found);
  }
  return undefined;
}

export async function getItemByAirtableId(airtableId: string): Promise<PortfolioItem | undefined> {
  const { data } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .eq("airtable_id", airtableId)
    .maybeSingle();
  return data ? toItem(data) : undefined;
}

export async function saveItem(item: PortfolioItem): Promise<void> {
  const { error } = await supabaseAdmin.from("portfolio_items").upsert({
    id: item.id,
    airtable_id: item.airtableId ?? null,
    slug: item.slug ?? null,
    title: item.title,
    summary: item.summary ?? null,
    category: item.category,
    description: item.description,
    client: item.client,
    client_type: item.clientType ?? null,
    tags: item.tags ?? [],
    keywords: item.keywords ?? [],
    images: item.images,
    image_alts: item.imageAlts ?? [],
    published: item.published,
    featured: item.featured ?? false,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  });
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("portfolio_items").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteItemByAirtableId(airtableId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("portfolio_items")
    .delete()
    .eq("airtable_id", airtableId);
  if (error) throw error;
}
