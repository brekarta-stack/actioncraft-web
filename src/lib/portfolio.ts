import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase-admin";
export type { Category, PortfolioItem } from "./portfolio-types";
export { CATEGORIES } from "./portfolio-types";
import type { PortfolioItem } from "./portfolio-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toItem(row: any): PortfolioItem {
  return {
    id: row.id,
    airtableId: row.airtable_id ?? undefined,
    title: row.title,
    category: row.category,
    description: row.description,
    client: row.client,
    images: row.images ?? [],
    published: row.published,
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
    title: item.title,
    category: item.category,
    description: item.description,
    client: item.client,
    images: item.images,
    published: item.published,
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
