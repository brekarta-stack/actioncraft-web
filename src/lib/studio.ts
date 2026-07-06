/**
 * 종이모형 스튜디오(/studio) — 사전 생성 카탈로그 데이터.
 *
 * 데이터 원천: papercraft-studio 레포의 결정적 엔진이 빌드 타임에 만든 산출물을
 * tools/web_publish.py 가 이 레포로 복사한다(로드맵 M0/M1).
 *   public/studio/<엔진버전>/index.json          — 큐레이션 목록(이 파일이 단일 소스)
 *   public/studio/<엔진버전>/<skey>/…            — thumb.png · model.glb · preview_p*.svg(워터마크)
 *   content-private/studio/<엔진버전>/<skey>/print.pdf — 인쇄 원본(공개 금지, 인증 라우트 전용)
 *
 * index.json 을 정적 import 하므로 런타임 fs 접근이 없고, 키 검증(getItem)이
 * 곧 화이트리스트라 경로 조작이 원천 차단된다.
 */

import catalog from "../../public/studio/v2.15.0/index.json";

export interface StudioItem {
  key: string;        // 엔진 카탈로그 키 (예: "d:taj")
  skey: string;       // URL/폴더 안전 키 (예: "d_taj")
  name_ko: string;
  category: string;
  pieces: number;
  pages: number;      // 도면 시트 수 (미리보기 페이저와 일치)
  pdf_pages: number;  // 실제 인쇄 장수 = PDF 페이지 수 (도면 + 조립 안내)
  finished_mm: number;
  stars: number;      // 난이도 1~5
  est_minutes: number;
  svg_sheets: number; // 미리보기 SVG 장수
}

export const STUDIO_VER: string = catalog.engine;      // "v2.15.0"
export const STUDIO_PAPER: string = catalog.paper;     // "A4"
export const STUDIO_ITEMS: StudioItem[] = catalog.items as StudioItem[];

/** 카테고리 표시 순서 (카탈로그에 있는 것만 노출) */
const CATEGORY_ORDER = ["탈것", "동물", "공룡", "세계 건축물", "한국 건축물", "캐릭터·오브젝트"];

export function itemsByCategory(): Array<{ category: string; items: StudioItem[] }> {
  const known = CATEGORY_ORDER.filter((c) => STUDIO_ITEMS.some((i) => i.category === c));
  const rest = Array.from(new Set(STUDIO_ITEMS.map((i) => i.category))).filter(
    (c) => !CATEGORY_ORDER.includes(c),
  );
  return [...known, ...rest].map((category) => ({
    category,
    items: STUDIO_ITEMS.filter((i) => i.category === category),
  }));
}

/** skey 화이트리스트 조회 — 없는 키는 undefined (라우트에서 404/경로조작 차단) */
export function getStudioItem(skey: string): StudioItem | undefined {
  return STUDIO_ITEMS.find((i) => i.skey === skey);
}

/** 공개 자산 경로 (/public 아래) */
export function studioAsset(skey: string, file: string): string {
  return `/studio/${STUDIO_VER}/${skey}/${file}`;
}

/** 난이도 별표 문자열 (★★☆☆☆) */
export function starsLabel(stars: number): string {
  const n = Math.max(1, Math.min(5, stars || 1));
  return "★".repeat(n) + "☆".repeat(5 - n);
}
