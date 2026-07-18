/**
 * 어드민 API 요청 body → Artist 필드 정규화 (create/update 공용).
 * route.ts 는 HTTP 메서드 외 export 가 금지라 별도 파일로 분리.
 */

import type { Artist } from "./artist-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeArtistBody(body: any): Omit<Artist, "id" | "createdAt" | "updatedAt"> {
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];
  const links = Array.isArray(body.links)
    ? body.links
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((l: any) => l && typeof l.label === "string" && typeof l.url === "string" && l.url.trim())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((l: any) => ({ label: l.label.trim() || "링크", url: l.url.trim() }))
    : [];
  const name = typeof body.name === "string" ? body.name.trim() : "";
  return {
    name,
    englishName:
      typeof body.englishName === "string" && body.englishName.trim() ? body.englishName.trim() : undefined,
    role: typeof body.role === "string" ? body.role.trim() : "",
    photo: typeof body.photo === "string" && body.photo.trim() ? body.photo.trim() : undefined,
    bio: typeof body.bio === "string" ? body.bio.trim() : "",
    specialties: strArr(body.specialties),
    styleTags: strArr(body.styleTags),
    career: strArr(body.career),
    portfolioTag:
      typeof body.portfolioTag === "string" && body.portfolioTag.trim() ? body.portfolioTag.trim() : name,
    links,
    published: body.published !== false,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
  };
}

/** DB 에러 → 사용자 안내 메시지 (테이블 미생성 감지) */
export function artistDbErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : "저장 실패";
  if (/(relation|schema cache|find the table)/i.test(msg)) {
    return "artists 테이블이 없습니다. supabase/migrations/20260607_artists.sql 을 Supabase SQL Editor 에서 실행해 주세요.";
  }
  return msg;
}
