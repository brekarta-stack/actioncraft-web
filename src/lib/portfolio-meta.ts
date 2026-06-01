/**
 * 포트폴리오 사례 SEO 메타 도우미.
 * - slug 자동 생성 (한국어/영문 혼합 안전)
 * - 이미지 alt 자동 채움
 * - 키워드/태그 정리
 */
import type { PortfolioItem } from "./portfolio-types";

/**
 * 문자열을 URL slug 로 변환.
 *  - 한국어 글자는 그대로 유지 (한국 검색에 유리)
 *  - 공백·구두점은 하이픈으로
 *  - 영문 대문자는 소문자
 *  - 연속 하이픈 / 양끝 하이픈 정리
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFC")
    // 한국어 글자(가-힣), 영문, 숫자만 남기고 나머지는 하이픈
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 사례에서 안정적인 slug 를 도출.
 * 우선순위: 명시된 slug → client + title → title → id 앞 8자
 */
export function deriveSlug(item: Pick<PortfolioItem, "slug" | "client" | "title" | "id">): string {
  if (item.slug && item.slug.trim()) return slugify(item.slug);
  const parts = [item.client, item.title].filter(Boolean).map(slugify).filter(Boolean);
  const joined = parts.join("-");
  if (joined) return joined;
  return `case-${item.id.slice(0, 8)}`;
}

/**
 * 이미지 alt 자동 생성.
 * 사용자가 imageAlts[i] 에 직접 입력했으면 그것을 우선, 아니면 title + 카테고리 + 태그 조합으로 생성.
 */
export function getImageAlt(item: PortfolioItem, index: number): string {
  const custom = item.imageAlts?.[index];
  if (custom && custom.trim()) return custom.trim();

  const parts: string[] = [];
  parts.push(item.title || "제작 사례");
  if (item.client) parts.push(item.client);
  if (item.category) parts.push(item.category);
  const t1 = item.tags?.[0];
  const t2 = item.tags?.[1];
  if (t1) parts.push(t1);
  if (t2) parts.push(t2);
  // 호버 이미지(인덱스 1)는 자연스럽게 "디테일"이라고 표기
  if (index > 0) parts.push("디테일 컷");
  return parts.filter(Boolean).join(" · ");
}

/**
 * Schema.org keywords / meta keywords 용 통합 키워드 배열.
 * title / client / category / tags / keywords 를 dedupe.
 */
export function getAllKeywords(item: PortfolioItem): string[] {
  const all = [
    item.client,
    item.category,
    item.clientType,
    ...(item.tags ?? []),
    ...(item.keywords ?? []),
    "페이퍼 엔지니어링",
    "주문 제작",
  ].filter((v): v is string => !!v && !!v.trim());
  return Array.from(new Set(all.map((s) => s.trim())));
}

/**
 * 표시용 summary 한 줄 — summary 가 없으면 description 첫 1~2문장에서 추출.
 */
export function deriveSummary(item: PortfolioItem, maxLen = 160): string {
  if (item.summary && item.summary.trim()) {
    return item.summary.trim().slice(0, maxLen);
  }
  const text = (item.description ?? "").trim();
  if (!text) {
    // fallback: 카테고리 + 클라이언트
    const parts = [item.client, item.category, item.title].filter(Boolean).join(" · ");
    return `${parts} 제작 사례 — Paper Engineering Studio`;
  }
  // 첫 두 문장 (마침표 기준)
  const sentences = text.split(/(?<=[.!?。！？])\s+/);
  const head = sentences.slice(0, 2).join(" ");
  return head.slice(0, maxLen);
}
