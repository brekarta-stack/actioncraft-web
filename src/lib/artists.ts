/**
 * 아티스트 데이터 접근 (server-only) — 회사소개 아티스트 섹션 + 어드민 CRUD 의 단일 출처.
 *
 * 컨셉: PE Studio 로 수주된 프로젝트는 이 아티스트들이 직접 설계·작업한다.
 * 아티스트별 작품은 portfolio_items.tags 에 `portfolioTag` 값을 붙여 연결하고,
 * /portfolio?tag={portfolioTag} 딥링크로 필터된 갤러리를 보여준다.
 *
 * 저장소: Supabase `artists` 테이블 (마이그레이션: supabase/migrations/20260607_artists.sql)
 * 테이블이 아직 없으면 SEED_ARTISTS 로 폴백해 사이트는 정상 동작한다.
 */

import { supabaseAdmin } from "./supabase-admin";
import type { Artist } from "./artist-types";

export type { Artist } from "./artist-types";

/** DB 폴백용 시드 — 마이그레이션 SQL 이 동일 데이터를 INSERT 한다 */
export const SEED_ARTISTS: Artist[] = [
  {
    id: "artist-01",
    name: "아티스트 01",
    englishName: "Paper Engineer",
    role: "페이퍼 엔지니어 · 지기구조 설계",
    bio: "지기구조 설계 특허를 기반으로 움직이는 종이 구조를 설계합니다. 탄성력·기어·크랭크 등 메커니즘을 활용한 액션 페이퍼 토이가 주 분야입니다.",
    specialties: ["지기구조 설계", "액션 메커니즘", "전개도 최적화"],
    styleTags: ["리얼리즘", "구조 중심"],
    career: ["지기구조 설계 특허 참여", "관공서·기업 납품 다수"],
    portfolioTag: "아티스트 01",
    links: [],
    published: true,
    sortOrder: 1,
  },
  {
    id: "artist-02",
    name: "아티스트 02",
    englishName: "Character Designer",
    role: "일러스트레이터 · 캐릭터 디자인",
    bio: "기관·기업의 캐릭터 IP 를 입체로 옮기는 캐릭터라이즈 작업을 담당합니다. 원안의 인상을 최대한 살리는 면 분할과 색 설계가 강점입니다.",
    specialties: ["캐릭터라이즈", "면 분할 디자인", "브랜드 컬러 설계"],
    styleTags: ["캐릭터라이즈", "키즈 친화"],
    career: ["지자체 캐릭터 페이퍼토이 다수", "박물관 체험존 교구 디자인"],
    portfolioTag: "아티스트 02",
    links: [],
    published: true,
    sortOrder: 2,
  },
  {
    id: "artist-03",
    name: "아티스트 03",
    englishName: "Popup Structure Designer",
    role: "팝업 스트럭처 디자이너",
    bio: "펼치는 순간 완성되는 다층 팝업 구조를 설계합니다. 카드·북·전시 연출물까지 종이가 만드는 극적인 순간을 디자인합니다.",
    specialties: ["다층 팝업 구조", "팝업북 제본 설계", "전시 연출물"],
    styleTags: ["팝업", "정교한 구조"],
    career: ["기업 프로모션 팝업북 다수", "백화점 전시 연출물 제작"],
    portfolioTag: "아티스트 03",
    links: [],
    published: true,
    sortOrder: 3,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArtist(row: any): Artist {
  return {
    id: row.id,
    name: row.name,
    englishName: row.english_name ?? undefined,
    role: row.role ?? "",
    photo: row.photo ?? undefined,
    bio: row.bio ?? "",
    specialties: Array.isArray(row.specialties) ? row.specialties : [],
    styleTags: Array.isArray(row.style_tags) ? row.style_tags : [],
    career: Array.isArray(row.career) ? row.career : [],
    portfolioTag: row.portfolio_tag ?? row.name,
    links: Array.isArray(row.links) ? row.links : [],
    published: !!row.published,
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 전체 아티스트 조회 (어드민용 — 비공개 포함).
 * source: "db" 정상 / "seed" 테이블 없음·에러 폴백 (어드민에서 마이그레이션 안내용)
 */
export async function getAllArtists(): Promise<{ artists: Artist[]; source: "db" | "seed" }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("artists")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { artists: (data ?? []).map(toArtist), source: "db" };
  } catch {
    return { artists: SEED_ARTISTS, source: "seed" };
  }
}

/** 사이트 노출용 — published 만 */
export async function getPublishedArtists(): Promise<Artist[]> {
  const { artists } = await getAllArtists();
  return artists.filter((a) => a.published);
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  try {
    const { data } = await supabaseAdmin.from("artists").select("*").eq("id", id).maybeSingle();
    if (data) return toArtist(data);
  } catch {
    /* fall through to seed */
  }
  return SEED_ARTISTS.find((a) => a.id === id);
}

export async function saveArtist(artist: Artist): Promise<void> {
  const { error } = await supabaseAdmin.from("artists").upsert({
    id: artist.id,
    name: artist.name,
    english_name: artist.englishName ?? null,
    role: artist.role,
    photo: artist.photo ?? null,
    bio: artist.bio,
    specialties: artist.specialties,
    style_tags: artist.styleTags,
    career: artist.career,
    portfolio_tag: artist.portfolioTag,
    links: artist.links,
    published: artist.published,
    sort_order: artist.sortOrder,
    created_at: artist.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteArtist(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("artists").delete().eq("id", id);
  if (error) throw error;
}
