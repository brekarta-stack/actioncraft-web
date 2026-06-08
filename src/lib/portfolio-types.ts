// 카테고리 목록 — 갤러리 필터 탭 + 어드민 에디터 셀렉트의 단일 출처.
// (구) catch-all "기타" 제거됨. 미사용이던 "우드락"을 "모자/마스크"로 교체.
export const CATEGORIES = ["팝업북", "페이퍼 크래프트", "액션 크래프트", "모자/마스크"] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * 추천 클라이언트 유형 — Schema.org audience 매칭 + SEO 키워드 노출용.
 * 자유 입력도 가능하지만 가능하면 이 중 하나를 고르면 일관성/검색 효과 ↑
 */
export const CLIENT_TYPES = [
  "박물관·과학관",
  "지자체·관광",
  "기업·브랜드",
  "키즈·교육",
  "백화점·유통",
  "전시·행사",
  "기타",
] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

/**
 * 사전 정의 태그 — Editor 에서 클릭 한 번으로 추가 가능.
 * 자유 태그 입력도 허용. SEO 매칭 강화용.
 */
export const SUGGESTED_TAGS = [
  "어린이 체험존",
  "STEAM 교구",
  "지역 캐릭터",
  "전시 굿즈",
  "브랜드 캐릭터",
  "기업 노벨티",
  "팝업 카드",
  "오토마타",
  "캠페인 굿즈",
  "박물관 굿즈",
  "지자체 굿즈",
  "교육 키트",
] as const;

export interface PortfolioItem {
  id: string;
  airtableId?: string;
  /** URL 슬러그. /portfolio/{slug} 로 접근. 비어 있으면 id 앞 8자로 fallback. */
  slug?: string;
  title: string;
  /** 1~2문장 SEO 요약 — og:description / Schema.org description 으로 사용 */
  summary?: string;
  category: Category;
  /** 클라이언트 명 (예: 현대백화점, 경주박물관) */
  client: string;
  /** 클라이언트 유형 분류 — 세그먼트별 검색 매칭 */
  clientType?: ClientType;
  /** 자유 태그 배열 */
  tags?: string[];
  /** 추가 SEO 키워드 (head 의 keywords meta 용) */
  keywords?: string[];
  description: string;
  images: string[];
  /** images 각각의 alt 텍스트 (인덱스 일치). 비어있으면 title 기반 자동 생성. */
  imageAlts?: (string | null)[];
  published: boolean;
  /** 홈 "이런 걸 만듭니다" 섹션에 노출할지 — 어드민에서 체크박스 토글 */
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}
