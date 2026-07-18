/**
 * 아티스트 타입 정의 — 클라이언트/서버 공용.
 * (DB 접근 함수는 server-only 인 src/lib/artists.ts 에 있음)
 */

export interface Artist {
  /** URL-safe 고유 슬러그 (안정 식별자) */
  id: string;
  /** 표시 이름 (실명 또는 활동명) */
  name: string;
  /** 영문 표기 (선택) */
  englishName?: string;
  /** 직함/전문 분야 한 줄 (예: "페이퍼 엔지니어 · 지기구조 설계") */
  role: string;
  /** 프로필 사진 URL — 정사각형 권장. 비우면 이니셜 아바타로 대체 */
  photo?: string;
  /** 2~3문장 소개 */
  bio: string;
  /** 전문 영역 목록 (카드에 리스트로 노출) */
  specialties: string[];
  /** 작업 스타일 키워드 — 프로필 사진 위 칩 오버레이 */
  styleTags: string[];
  /** 주요 이력·대표 프로젝트 (최대 3개 노출) */
  career: string[];
  /**
   * portfolio_items.tags 와 매칭되는 태그.
   * 이 태그가 붙은 작품이 "이 아티스트 작품 보기" 필터 결과로 나온다.
   */
  portfolioTag: string;
  /** 외부 포트폴리오/SNS 링크 (선택) */
  links: { label: string; url: string }[];
  /** 사이트 노출 여부 */
  published: boolean;
  /** 노출 순서 (작을수록 앞) */
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 어드민 저장 요청 바디 (id 는 신규 시 서버가 생성) */
export type ArtistInput = Omit<Artist, "id" | "createdAt" | "updatedAt"> & { id?: string };
