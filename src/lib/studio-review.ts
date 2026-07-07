/**
 * 종이모형 스튜디오 도면 검수(review) — 서버 전용 헬퍼.
 *
 * 검수 상태는 Supabase `studio_reviews` 테이블에 저장한다(마이그레이션:
 * supabase/migrations/20260707_studio_reviews.sql). 카탈로그의 모든 도면(skey)은
 * 기본 미검수(pending) 이며, 행이 존재할 때만 approved/rejected 로 본다.
 *
 * 관리자는 /admin/studio-review 에서 하루에 한 개씩 검수한다. 여기서는
 *  - 전체 검수 상태 맵 조회(테이블 부재에 내성)
 *  - 통계(검수완료/미검수/진행률)
 *  - '오늘의 검수' 대상 선정(카탈로그 순서상 첫 미검수)
 *  - 오늘 검수한 건수(하루 한 개 페이스 판정)
 * 를 계산한다.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import { STUDIO_ITEMS, CATEGORY_ORDER, type StudioItem } from "@/lib/studio";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewRow {
  skey: string;
  status: ReviewStatus;
  note: string | null;
  reviewer: string | null;
  reviewed_at: string | null; // ISO
}

export interface ReviewedItem extends StudioItem {
  status: ReviewStatus;
  note: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
}

/** KST(Asia/Seoul) 기준 YYYY-MM-DD 문자열 */
export function kstDate(d: Date = new Date()): string {
  // en-CA 로케일이 YYYY-MM-DD 형식을 준다.
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

/**
 * studio_reviews 전체를 skey→row 맵으로 조회.
 * 테이블이 아직 없으면 tableMissing=true 로 알리고 빈 맵 반환(페이지는 전부 미검수로 표시).
 */
export async function getReviewMap(): Promise<{
  map: Record<string, ReviewRow>;
  tableMissing: boolean;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("studio_reviews")
      .select("skey, status, note, reviewer, reviewed_at");

    if (error) {
      const missing =
        error.message.includes("does not exist") ||
        error.message.includes("schema cache") ||
        error.code === "PGRST205" ||
        error.code === "42P01";
      return { map: {}, tableMissing: missing };
    }

    const map: Record<string, ReviewRow> = {};
    for (const r of data ?? []) {
      map[r.skey] = {
        skey: r.skey,
        status: (r.status as ReviewStatus) ?? "pending",
        note: r.note ?? null,
        reviewer: r.reviewer ?? null,
        reviewed_at: r.reviewed_at ?? null,
      };
    }
    return { map, tableMissing: false };
  } catch {
    return { map: {}, tableMissing: true };
  }
}

/**
 * 카탈로그 전 도면에 검수 상태를 합쳐 반환.
 * 순서는 사이트 카테고리 순(CATEGORY_ORDER, 탈것→…→도형), 같은 분류 안에서는
 * 카탈로그 순서를 유지 → '오늘의 검수'가 인기 카테고리부터 순차 진행되게.
 */
export function mergeItems(map: Record<string, ReviewRow>): ReviewedItem[] {
  const catIdx = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i < 0 ? CATEGORY_ORDER.length : i;
  };
  // 원본(카탈로그) 순서 = 분류 내 안정 정렬 기준
  const origIdx = new Map(STUDIO_ITEMS.map((it, i) => [it.skey, i]));
  const merged: ReviewedItem[] = STUDIO_ITEMS.map((it) => {
    const r = map[it.skey];
    return {
      ...it,
      status: r?.status ?? "pending",
      note: r?.note ?? null,
      reviewer: r?.reviewer ?? null,
      reviewed_at: r?.reviewed_at ?? null,
    };
  });
  return merged.sort(
    (a, b) =>
      catIdx(a.category) - catIdx(b.category) ||
      (origIdx.get(a.skey)! - origIdx.get(b.skey)!),
  );
}

export interface ReviewStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  reviewed: number; // approved + rejected (=검수 처리 완료)
  percent: number; // reviewed / total
  reviewedToday: number;
  today: string; // KST YYYY-MM-DD
}

export function computeStats(items: ReviewedItem[]): ReviewStats {
  const today = kstDate();
  let approved = 0,
    rejected = 0,
    reviewedToday = 0;
  for (const it of items) {
    if (it.status === "approved") approved++;
    else if (it.status === "rejected") rejected++;
    if (it.reviewed_at && kstDate(new Date(it.reviewed_at)) === today) reviewedToday++;
  }
  const total = items.length;
  const reviewed = approved + rejected;
  return {
    total,
    approved,
    rejected,
    pending: total - reviewed,
    reviewed,
    percent: total ? Math.round((reviewed / total) * 100) : 0,
    reviewedToday,
    today,
  };
}

/** '오늘의 검수' 대상 = 카탈로그 순서상 첫 미검수 도면(없으면 null=전부 완료) */
export function pickTodayTarget(items: ReviewedItem[]): ReviewedItem | null {
  return items.find((it) => it.status === "pending") ?? null;
}
