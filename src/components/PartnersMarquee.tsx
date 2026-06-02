"use client";

/**
 * PartnersMarquee — 파트너 로고 무한 슬라이드
 *
 * - CSS 애니메이션 기반 (성능 가벼움, JS 최소)
 * - 그레이스케일 → 컬러 hover 전환 (CSS filter)
 * - 섹션 hover 시 애니메이션 일시정지 (.marquee-container)
 * - 로고 URL 우선 → 404 등 실패 시 자동으로 wordmark 텍스트 fallback
 * - 로고 출처: Wikimedia Commons (공공 도메인)
 *
 * 정식 로고 URL 이 없는 기관은 logo: null 로 두면 텍스트 wordmark 로 표시됨.
 * 정확한 SVG URL 을 받으면 logo 필드에 채우면 됩니다.
 */

import { useState } from "react";

interface Partner {
  id: string;
  name: string;
  /** Wikimedia Commons 등 정식 SVG URL. 없으면 null → 텍스트 wordmark 표시 */
  logo: string | null;
  /** 로고 너비 (px). 텍스트일 때는 컨테이너 폭 기준 */
  width: number;
}

/* ─── 1행 ─── */
const PARTNERS_ROW1: Partner[] = [
  {
    id: "hyundai-dept",
    name: "현대백화점",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Hyundai_Department_Store_Group_CI.svg",
    width: 140,
  },
  {
    id: "hyundai-motor",
    name: "현대자동차",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
    width: 130,
  },
  {
    id: "innocean",
    name: "이노션",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Innocean_logo.png",
    width: 120,
  },
  {
    id: "samsung-display",
    name: "삼성디스플레이",
    logo: null, // 공개 SVG 미확인 — 정식 로고 URL 받으면 교체
    width: 132,
  },
  {
    id: "samyang",
    name: "삼양식품",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Samyang_Foods_Logo.svg",
    width: 130,
  },
  {
    id: "kaist",
    name: "KAIST",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/KAIST_logo.svg",
    width: 96,
  },
  {
    id: "samsung",
    name: "삼성",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Samsung_wordmark.svg",
    width: 130,
  },
  {
    id: "lg",
    name: "LG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/LG_logo_%282023%29.svg",
    width: 60,
  },
  {
    id: "lotte",
    name: "롯데",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Lotte_Logo_%282017%29.svg",
    width: 110,
  },
];

/* ─── 2행 ─── */
const PARTNERS_ROW2: Partner[] = [
  {
    id: "nmk",
    name: "국립중앙박물관",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Logo_of_National_Museum_of_Korea.svg",
    width: 120,
  },
  {
    id: "gyeongju-museum",
    name: "경주박물관",
    logo: null,
    width: 112,
  },
  {
    id: "ulsan",
    name: "울산시",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Symbol_of_Ulsan.svg",
    width: 48, // 정사각 심볼
  },
  {
    id: "suwon",
    name: "수원시",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/Flag_of_Suwon_%282022%29.svg",
    width: 80,
  },
  {
    id: "gongju",
    name: "공주시",
    logo: null,
    width: 72,
  },
  {
    id: "seoul",
    name: "서울특별시",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Logo_of_Seoul%2C_South_Korea.svg",
    width: 52,
  },
  {
    id: "kto",
    name: "한국관광공사",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Korea-Tourism-Organization-ko.svg",
    width: 130,
  },
  {
    id: "kt",
    name: "KT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/KT_Corp_2D_logo.svg",
    width: 68,
  },
];

/* ─── 개별 로고 아이템 (로딩 실패 시 자동 텍스트 fallback) ─── */
function LogoItem({ item }: { item: Partner }) {
  const [failed, setFailed] = useState(false);
  const showImage = item.logo && !failed;

  return (
    <div
      className="flex-shrink-0 h-12 mx-8 flex items-center justify-center partner-logo-wrap"
      style={{ width: item.width }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logo!}
          alt={item.name}
          title={item.name}
          className="partner-logo max-h-10 w-auto object-contain"
          draggable={false}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="partner-logo-text text-sm font-bold tracking-tight text-slate-400">
          {item.name}
        </span>
      )}
    </div>
  );
}

/* ─── 무한 스크롤 트랙 ─── */
function MarqueeTrack({
  items,
  reverse = false,
}: {
  items: Partner[];
  reverse?: boolean;
}) {
  // 자연스러운 무한 루프를 위해 한 번 더 복제
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div className={reverse ? "marquee-track-rev" : "marquee-track"}>
        {doubled.map((p, i) => (
          <LogoItem key={`${p.id}-${i}`} item={p} />
        ))}
      </div>
    </div>
  );
}

/* ─── 메인 export ─── */
export default function PartnersMarquee() {
  return (
    <div className="marquee-container" aria-label="함께한 파트너 로고">
      <MarqueeTrack items={PARTNERS_ROW1} />
      <MarqueeTrack items={PARTNERS_ROW2} reverse />
    </div>
  );
}
