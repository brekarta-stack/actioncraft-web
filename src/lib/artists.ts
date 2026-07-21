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
    name: "김철호",
    englishName: "Kim Cheol-ho",
    role: "페이퍼 엔지니어 · 페이퍼크래프트 설계·생산",
    // 공개 기록(위키백과·언론) 기반 — '종이천하' 설립자 김철호. 사장님 확인 후 다듬어 주세요.
    bio: "중학생 때 종이모형에 빠져 직접 전개도를 설계하기 시작했고, 2001년 국내 최대 페이퍼크래프트 커뮤니티 '종이천하'를 만들며 한국 종이모형 문화의 기틀을 다졌습니다. 종이모형 제작사를 거쳐 오랜 기간 의뢰받은 모형을 직접 설계·제작·납품해 왔습니다. PE Studio에서는 페이퍼크래프트 설계와 생산을 맡습니다.",
    specialties: ["페이퍼크래프트 설계", "전개도 도안", "종이모형 생산"],
    styleTags: ["리얼리즘", "정교한 설계"],
    career: [
      "국내 최대 페이퍼크래프트 커뮤니티 '종이천하' 설립 (2001)",
      "국내 종이모형 제작사 근무",
      "페이퍼크래프트 교육 도서 『철호의 종이모형 이야기』 발간",
    ],
    portfolioTag: "김철호",
    links: [{ label: "종이천하 커뮤니티", url: "http://www.finalpaper.net/" }],
    published: true,
    sortOrder: 1,
  },
  {
    id: "artist-02",
    name: "짬뽕",
    role: "페이퍼크래프트 미니어처 전문가",
    // 공개 정보 미확인 — 주신 전문 분야만 반영한 골격. 상세 이력은 어드민에서 채워 주세요.
    bio: "작은 스케일에 정교함을 담는 페이퍼크래프트 미니어처를 전문으로 합니다. 손바닥에 올라가는 작은 종이 모형에도 디테일과 완성도를 놓치지 않습니다.",
    specialties: ["페이퍼크래프트 미니어처", "소형 종이 모형 설계", "정밀 디테일"],
    styleTags: ["미니어처", "정밀"],
    career: [],
    portfolioTag: "짬뽕",
    links: [],
    published: true,
    sortOrder: 2,
  },
  {
    id: "artist-03",
    name: "박형미",
    englishName: "Park Hyung-mi",
    role: "팝업북 전문 아티스트",
    // 공개 정보 미확인 — 주신 전문 분야만 반영한 골격. 상세 이력은 어드민에서 채워 주세요.
    bio: "펼치는 순간 입체로 살아나는 팝업북을 전문으로 합니다. 종이의 접힘과 구조를 설계해 페이지 위에서 이야기가 튀어나오는 경험을 만듭니다.",
    specialties: ["팝업북 설계", "입체 구조 디자인", "페이퍼 엔지니어링"],
    styleTags: ["팝업", "스토리텔링"],
    career: [],
    portfolioTag: "박형미",
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
