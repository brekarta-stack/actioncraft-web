import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { STUDIO_VER, orderedCategories, STUDIO_ITEMS } from "@/lib/studio";
import { getReviewMap, mergeItems, kstDate } from "@/lib/studio-review";
import StudioReviewClient, { type ReviewItem } from "@/components/admin/StudioReviewClient";

export const dynamic = "force-dynamic";

export default async function StudioReviewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { map, tableMissing } = await getReviewMap();
  const merged = mergeItems(map);

  const items: ReviewItem[] = merged.map((it) => ({
    skey: it.skey,
    name_ko: it.name_ko,
    category: it.category,
    pieces: it.pieces,
    pdf_pages: it.pdf_pages,
    svg_sheets: it.svg_sheets,
    finished_mm: it.finished_mm,
    stars: it.stars,
    status: it.status,
    note: it.note,
    reviewer: it.reviewer,
    reviewed_at: it.reviewed_at,
  }));

  return (
    <StudioReviewClient
      ver={STUDIO_VER}
      items={items}
      categories={orderedCategories(STUDIO_ITEMS)}
      tableMissing={tableMissing}
      today={kstDate()}
    />
  );
}
