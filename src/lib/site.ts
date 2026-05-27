/**
 * 사이트 전역 설정 - 메타데이터, 구조화 데이터, sitemap, robots 등에서 공통 사용.
 *
 * NEXT_PUBLIC_SITE_URL 환경변수가 있으면 그것을 사용, 없으면 papercraft.kr.
 * (NEXTAUTH_URL 은 인증 콜백용이므로 분리)
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.papercraft.kr";

/**
 * 브랜드 네이밍 가이드
 *
 * - 정식 명칭: Paper Engineering Studio
 * - 약칭: PE Studio
 * - 한글 슬로건: "국내 유일의 페이퍼 엔지니어링 스튜디오" (검색어 자산 확보용 반복 키워드)
 */
export const SITE_NAME = "Paper Engineering Studio";
export const SITE_SHORT = "PE Studio";
export const BRAND_TAGLINE_KR = "국내 유일의 페이퍼 엔지니어링 스튜디오";
export const BRAND_TAGLINE_EN = "Korea's Only Paper Engineering Studio";

export const SITE_DESCRIPTION =
  "Paper Engineering Studio(PE Studio)는 자기 구조 설계 특허 11종을 보유한 국내 유일의 페이퍼 엔지니어링 스튜디오입니다. 움직이는 페이퍼토이·팝업카드·STEAM 교구·기업 굿즈를 주문 제작합니다. 현대백화점·KAIST 등 1,000건 이상 납품 실적.";

/**
 * 회사 정보 (Schema.org Organization, 푸터, 연락처 등에서 공통 사용)
 *
 * TODO: 사용자 확인 필요 항목 - placeholder 로 유지
 * - businessNumber: 사업자등록번호
 * - phone: 실제 연락처 (또는 카카오톡 채널 URL)
 * - kakaoChannel: 카카오톡 채널 URL
 * - addressDetail: 구체 주소
 * - foundingYear: 정확한 설립 연도
 */
interface CompanyInfo {
  name: string;
  shortName: string;
  legalName: string;
  email: string;
  phone: string;
  kakaoChannel: string;
  address: {
    locality: string;
    region: string;
    country: string;
    streetAddress: string;
  };
  foundingYear: string;
  businessNumber: string;
  social: {
    instagram: string;
    youtube: string;
    community: string;
  };
}

export const COMPANY: CompanyInfo = {
  name: SITE_NAME,
  shortName: SITE_SHORT,
  legalName: "Paper Engineering Studio",
  email: "hello@papercraft.kr",
  // TODO: 실제 연락처로 교체 (사용자 입력 필요)
  phone: "",
  kakaoChannel: "",
  address: {
    locality: "서울",
    region: "서울특별시",
    country: "KR",
    // TODO: 상세 주소 (사용자 입력 필요)
    streetAddress: "",
  },
  // TODO: 정확한 연도 확인 (사용자 입력 필요)
  foundingYear: "2018",
  // TODO: 실제 사업자등록번호 (사용자 입력 필요)
  businessNumber: "",
  social: {
    instagram: "",
    youtube: "",
    community: "",
  },
};

/**
 * 페이지별 메타데이터 사전 정의
 * - title 은 layout.tsx 의 template "%s | PE Studio" 가 자동으로 붙이므로 suffix 없이 작성
 * - "페이퍼 엔지니어링" 키워드를 핵심 페이지에 반복 노출
 */
export const PAGE_META = {
  home: {
    title: "국내 유일의 페이퍼 엔지니어링 스튜디오",
    description:
      "Paper Engineering Studio — 자기 구조 설계 특허 11종을 보유한 국내 유일의 페이퍼 엔지니어링 스튜디오. 움직이는 페이퍼토이·팝업카드·STEAM 교구를 주문 제작합니다. 현대백화점·KAIST 등 1,000건 이상 납품.",
  },
  about: {
    title: "회사소개 — 국내 유일의 페이퍼 엔지니어링 스튜디오",
    description:
      "PE Studio(Paper Engineering Studio)는 자기 구조 설계 특허 11종을 보유한 국내 유일의 페이퍼 엔지니어링 스튜디오입니다. KAIST 출신 개발자, 글로벌 아티스트 네트워크, STEAM 교육 전문성을 갖췄습니다.",
  },
  products: {
    title: "페이퍼 엔지니어링 주문 제작 서비스",
    description:
      "Action Paper Toy, STEAM 교육 키트, 캐릭터 굿즈, BI/CI 편집 디자인. 페이퍼 엔지니어링 기술로 최소 1,000부부터 평균 3~4주 납기로 페이퍼토이 외주 제작이 가능합니다.",
  },
  portfolio: {
    title: "현대백화점·KAIST 페이퍼 엔지니어링 제작 사례",
    description:
      "현대백화점 스마일리, KAIST 납육이, 경주박물관 도토리, 수원시 수원이 등 PE Studio가 페이퍼 엔지니어링 기술로 제작한 페이퍼토이·캐릭터 굿즈 사례.",
  },
  blog: {
    title: "페이퍼 엔지니어링 원리·STEAM 교육 블로그",
    description:
      "오토마타 원리, 팝업카드 설계법, STEAM 교육 활용 사례, 브랜드 굿즈 제작 비하인드 등 페이퍼 엔지니어링 콘텐츠.",
  },
  quote: {
    title: "1분 자동견적 — 페이퍼 엔지니어링 제작 비용 문의",
    description:
      "수량·옵션·납기를 입력하면 즉시 추정 단가를 확인할 수 있습니다. 영업일 1~2일 내 담당자가 맞춤 견적을 회신드립니다.",
  },
  faq: {
    title: "자주 묻는 질문 — 페이퍼 엔지니어링 제작 FAQ",
    description:
      "최소 수량, 평균 납기, 디자인 보유 여부, 지자체 입찰, 가격대 등 페이퍼 엔지니어링 외주 제작 시 자주 묻는 질문.",
  },
} as const;
