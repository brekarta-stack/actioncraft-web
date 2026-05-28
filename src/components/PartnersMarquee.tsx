/**
 * PartnersMarquee — 파트너 로고 무한 슬라이드
 *
 * - 서버 컴포넌트 (순수 CSS 애니메이션, JS 불필요)
 * - 그레이스케일 → 컬러 hover 전환 (CSS filter)
 * - 섹션 hover 시 애니메이션 일시정지 (.marquee-container)
 * - 로고 출처: Wikimedia Commons (공공 도메인)
 */

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  width: number;
}

const PARTNERS_ROW1: Partner[] = [
  {
    id: "hyundai-dept",
    name: "현대백화점",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Hyundai_Department_Store_Group_CI.svg",
    width: 140,
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
  {
    id: "hyundai-motor",
    name: "현대자동차",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
    width: 130,
  },
];

const PARTNERS_ROW2: Partner[] = [
  {
    id: "nmk",
    name: "국립중앙박물관",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Logo_of_National_Museum_of_Korea.svg",
    width: 120,
  },
  {
    id: "kt",
    name: "KT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/KT_Corp_2D_logo.svg",
    width: 68,
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
    id: "suwon",
    name: "수원시",
    logo: null,
    width: 72,
  },
  {
    id: "gongju",
    name: "공주시",
    logo: null,
    width: 72,
  },
];

/* ─── 개별 로고 아이템 ─── */
function LogoItem({ item }: { item: Partner }) {
  return (
    <div
      className="flex-shrink-0 h-12 mx-8 flex items-center justify-center partner-logo-wrap"
      style={{ width: item.width }}
    >
      {item.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logo}
          alt={item.name}
          title={item.name}
          className="partner-logo max-h-10 w-auto object-contain"
          draggable={false}
        />
      ) : (
        /* 전용 로고 없는 경우: 텍스트 배지 */
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
