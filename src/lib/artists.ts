/**
 * 아티스트 정보 스키마 + 데이터 — 회사소개 아티스트 섹션의 단일 출처.
 *
 * 컨셉: PE Studio 로 수주된 프로젝트는 이 아티스트들이 직접 설계·작업한다.
 * 아티스트별 작품은 portfolio_items.tags 에 `portfolioTag` 값을 붙여 연결하고,
 * /portfolio?tag={portfolioTag} 딥링크로 필터된 갤러리를 보여준다.
 *
 * ── 운영 방법 ──
 * 1. 아래 ARTISTS 배열의 플레이스홀더를 실제 정보로 교체
 * 2. 프로필 사진: Supabase Storage(uploads)에 정사각형 이미지 업로드 후 URL 을 photo 에
 * 3. 어드민 > 납품 사례 편집 화면의 "작업 아티스트" chips 로 각 작품에 태그 부착
 * 4. published: true 인 아티스트만 사이트에 노출됨
 */

export interface Artist {
  /** URL-safe 고유 슬러그 (안정 식별자 — 변경하지 말 것) */
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
  /** 작업 스타일 키워드 — 견적 폼의 스타일 옵션과 톤 맞춤 (리얼리즘/캐릭터라이즈 등) */
  styleTags: string[];
  /** 주요 이력·대표 프로젝트 (최대 3개 노출) */
  career?: string[];
  /**
   * portfolio_items.tags 와 매칭되는 태그.
   * 이 태그가 붙은 작품이 "이 아티스트 작품 보기" 필터 결과로 나온다.
   * 이름을 바꾸면 기존 작품 태그도 함께 바꿔야 한다.
   */
  portfolioTag: string;
  /** 외부 포트폴리오/SNS 링크 (선택) */
  links?: { label: string; url: string }[];
  /** 사이트 노출 여부 */
  published: boolean;
}

/**
 * ⚠️ 플레이스홀더 데이터 — 실제 아티스트 정보로 교체 필요.
 * 이름·소개·이력을 실제 값으로 채우고, 프로필 사진 URL 을 넣어 주세요.
 */
export const ARTISTS: Artist[] = [
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
    published: true,
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
    published: true,
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
    published: true,
  },
];

/** 사이트에 노출할 아티스트만 */
export function getPublishedArtists(): Artist[] {
  return ARTISTS.filter((a) => a.published);
}

/** 어드민 에디터의 "작업 아티스트" quick-select 용 태그 목록 */
export function getArtistTags(): string[] {
  return ARTISTS.map((a) => a.portfolioTag);
}
