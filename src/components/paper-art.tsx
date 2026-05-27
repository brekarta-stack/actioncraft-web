/**
 * PE Studio 시각 자산 보완용 CSS / SVG 아트 컴포넌트.
 *
 * 실제 페이퍼토이 사진/영상 자산이 준비될 때까지 사이트 인상을
 * 페이퍼 엔지니어링답게 채워주기 위한 일러스트들.
 *
 * 디자인 언어:
 * - 흰색·반투명 화이트 면 + 가는 점선/실선의 접힘선 → "전개도" 메타포
 * - 부드러운 그림자(2~3 stop) → "종이 두께" 표현
 * - 살짝 움직이는 keyframes (rotate, translate) → "스스로 움직이는 종이" 시그니처
 */

import type { CSSProperties } from "react";

/* ──────────────────────────────────────────────────
 * PaperToyHero
 * 히어로용 메인 일러스트. 종이로 접힌 캐릭터 + 떠다니는 종이 조각.
 * "움직임"이 핵심이므로 미세한 floating / rotation animation 적용.
 * ────────────────────────────────────────────────── */
export function PaperToyHero({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {/* 떠다니는 종이 조각 — 배경 deco */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingPaper className="absolute top-[8%] left-[12%]" size={36} delay={0} hue="cyan" />
        <FloatingPaper className="absolute top-[22%] right-[18%]" size={28} delay={1.2} hue="pink" />
        <FloatingPaper className="absolute bottom-[18%] left-[20%]" size={44} delay={2.4} hue="amber" />
        <FloatingPaper className="absolute bottom-[10%] right-[10%]" size={32} delay={0.8} hue="violet" />
        <FloatingPaper className="absolute top-[55%] left-[5%]" size={22} delay={3.0} hue="cyan" />
      </div>

      {/* 메인 페이퍼토이 캐릭터 */}
      <div className="relative w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-md drop-shadow-2xl"
          style={{ animation: "pe-toy-bob 6s ease-in-out infinite" }}
        >
          <defs>
            <linearGradient id="paper-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e8edff" />
            </linearGradient>
            <linearGradient id="paper-side" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfe7ff" />
              <stop offset="100%" stopColor="#bcc7f5" />
            </linearGradient>
            <filter id="paper-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="0" dy="8" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.35" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 그라데이션 글로우 — 배경 */}
          <circle cx="200" cy="220" r="170" fill="url(#paper-face)" opacity="0.05" />

          {/* 다리 1 (왼쪽 종이 접힘) */}
          <g filter="url(#paper-shadow)" style={{ transformOrigin: "175px 290px", animation: "pe-leg-l 3s ease-in-out infinite" }}>
            <path d="M165 280 L185 280 L188 360 L168 360 Z" fill="url(#paper-face)" stroke="#9aa6d4" strokeWidth="1" />
            <path d="M165 280 L185 280" stroke="#9aa6d4" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* 다리 2 (오른쪽) */}
          <g filter="url(#paper-shadow)" style={{ transformOrigin: "225px 290px", animation: "pe-leg-r 3s ease-in-out infinite" }}>
            <path d="M215 280 L235 280 L232 360 L212 360 Z" fill="url(#paper-side)" stroke="#9aa6d4" strokeWidth="1" />
            <path d="M215 280 L235 280" stroke="#9aa6d4" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* 팔 (왼쪽) */}
          <g style={{ transformOrigin: "130px 200px", animation: "pe-arm-l 4s ease-in-out infinite" }}>
            <path d="M130 180 L150 175 L155 250 L135 255 Z" fill="url(#paper-face)" stroke="#9aa6d4" strokeWidth="1" filter="url(#paper-shadow)" />
          </g>

          {/* 팔 (오른쪽) */}
          <g style={{ transformOrigin: "270px 200px", animation: "pe-arm-r 4s ease-in-out infinite" }}>
            <path d="M250 175 L270 180 L265 255 L245 250 Z" fill="url(#paper-side)" stroke="#9aa6d4" strokeWidth="1" filter="url(#paper-shadow)" />
          </g>

          {/* 몸통 (앞면) */}
          <g filter="url(#paper-shadow)">
            <path d="M150 170 L250 170 L250 290 L150 290 Z" fill="url(#paper-face)" stroke="#9aa6d4" strokeWidth="1.5" />
            {/* 접힘선 */}
            <line x1="150" y1="200" x2="250" y2="200" stroke="#9aa6d4" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <line x1="200" y1="170" x2="200" y2="290" stroke="#9aa6d4" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            {/* 옷 디테일 — 가슴 포인트 */}
            <circle cx="200" cy="220" r="6" fill="#06C6C8" />
          </g>

          {/* 머리 */}
          <g filter="url(#paper-shadow)" style={{ transformOrigin: "200px 130px", animation: "pe-head-tilt 5s ease-in-out infinite" }}>
            {/* 머리 박스 */}
            <path d="M155 90 L245 90 L255 170 L145 170 Z" fill="url(#paper-face)" stroke="#9aa6d4" strokeWidth="1.5" />
            {/* 위쪽 접힘 */}
            <path d="M155 90 L175 70 L225 70 L245 90 Z" fill="url(#paper-side)" stroke="#9aa6d4" strokeWidth="1.5" />
            {/* 눈 */}
            <circle cx="180" cy="125" r="5" fill="#1E22B2" />
            <circle cx="220" cy="125" r="5" fill="#1E22B2" />
            <circle cx="181" cy="123" r="1.5" fill="white" />
            <circle cx="221" cy="123" r="1.5" fill="white" />
            {/* 미소 */}
            <path d="M185 145 Q200 155 215 145" stroke="#1E22B2" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* 볼터치 */}
            <circle cx="170" cy="140" r="4" fill="#E91E8C" opacity="0.3" />
            <circle cx="230" cy="140" r="4" fill="#E91E8C" opacity="0.3" />
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes pe-toy-bob {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes pe-head-tilt {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes pe-leg-l {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes pe-leg-r {
          0%, 100% { transform: rotate(4deg); }
          50% { transform: rotate(-4deg); }
        }
        @keyframes pe-arm-l {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-12deg); }
        }
        @keyframes pe-arm-r {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="pe-toy"], [style*="pe-toy"], [style*="pe-head"], [style*="pe-leg"], [style*="pe-arm"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────
 * FloatingPaper - 떠다니는 종이 조각
 * ────────────────────────────────────────────────── */
function FloatingPaper({
  className = "",
  size = 32,
  delay = 0,
  hue = "cyan",
}: {
  className?: string;
  size?: number;
  delay?: number;
  hue?: "cyan" | "pink" | "amber" | "violet";
}) {
  const colors = {
    cyan: "#06C6C8",
    pink: "#E91E8C",
    amber: "#F5C518",
    violet: "#8B5CF6",
  };
  const style: CSSProperties = {
    width: size,
    height: size,
    animation: `pe-float ${5 + delay}s ease-in-out ${delay}s infinite`,
  };
  return (
    <div className={className} style={style}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path
          d="M4 4 L18 4 L20 8 L20 20 L4 20 Z"
          fill={colors[hue]}
          opacity="0.18"
          stroke={colors[hue]}
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <path d="M18 4 L18 8 L20 8" stroke={colors[hue]} strokeWidth="1" strokeOpacity="0.4" fill="none" />
      </svg>
      <style>{`
        @keyframes pe-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(8deg); }
          66% { transform: translateY(8px) rotate(-6deg); }
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────
 * PortfolioPlaceholder
 * 포트폴리오 썸네일이 없을 때 사용하는 변형 패턴.
 * variant 별로 다른 시각적 인상(건물/박물관/캐릭터/도시) 표현.
 * ────────────────────────────────────────────────── */
export type PortfolioVariant =
  | "department" // 백화점
  | "university" // 대학·연구기관
  | "museum"     // 박물관
  | "city"       // 시·지자체
  | "character"  // 캐릭터
  | "generic";

const VARIANT_ACCENTS: Record<PortfolioVariant, { bg: string; fg: string; accent: string }> = {
  department: { bg: "#FFE8F0", fg: "#1E22B2", accent: "#E91E8C" },
  university: { bg: "#E8EDFF", fg: "#1E22B2", accent: "#06C6C8" },
  museum:     { bg: "#FFF3D0", fg: "#1E22B2", accent: "#F5C518" },
  city:       { bg: "#E0F7F8", fg: "#1E22B2", accent: "#06C6C8" },
  character:  { bg: "#F3E8FF", fg: "#1E22B2", accent: "#8B5CF6" },
  generic:    { bg: "#F0F2FF", fg: "#1E22B2", accent: "#1E22B2" },
};

export function PortfolioPlaceholder({
  variant = "generic",
  label,
  className = "",
}: {
  variant?: PortfolioVariant;
  label: string;
  className?: string;
}) {
  const c = VARIANT_ACCENTS[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex items-center justify-center ${className}`}
      style={{ background: c.bg }}
      role="img"
      aria-label={`${label} 페이퍼토이 시안`}
    >
      {/* 전개도 데코 */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-25" aria-hidden>
        <PaperNetPattern color={c.fg} />
      </svg>

      {/* variant 별 메인 일러스트 */}
      <div className="relative z-10 p-6 w-full h-full flex items-center justify-center">
        {variant === "department" && <DeptIllust color={c.accent} />}
        {variant === "university" && <UniIllust color={c.accent} />}
        {variant === "museum" && <MuseumIllust color={c.accent} />}
        {variant === "city" && <CityIllust color={c.accent} />}
        {variant === "character" && <CharacterIllust color={c.accent} />}
        {variant === "generic" && <GenericIllust color={c.accent} />}
      </div>

      {/* 라벨 */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-3 text-xs font-semibold backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.7)", color: c.fg }}
      >
        {label}
      </div>
    </div>
  );
}

function PaperNetPattern({ color }: { color: string }) {
  return (
    <>
      <rect x="40" y="20" width="60" height="40" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="20" y="60" width="40" height="80" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="60" y="60" width="60" height="80" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="120" y="60" width="40" height="80" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="60" y="140" width="60" height="40" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
    </>
  );
}

function DeptIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 백화점 건물 — 종이 접힘 */}
      <path d="M20 40 L60 25 L100 40 L100 90 L20 90 Z" fill="white" stroke={color} strokeWidth="1.5" />
      <path d="M20 40 L100 40" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <rect x="35" y="55" width="10" height="15" fill={color} opacity="0.3" />
      <rect x="55" y="55" width="10" height="15" fill={color} opacity="0.3" />
      <rect x="75" y="55" width="10" height="15" fill={color} opacity="0.3" />
      <rect x="50" y="75" width="20" height="15" fill={color} />
      {/* 스마일 페이퍼토이 */}
      <circle cx="60" cy="20" r="8" fill={color} />
      <circle cx="57" cy="18" r="1.5" fill="white" />
      <circle cx="63" cy="18" r="1.5" fill="white" />
      <path d="M56 22 Q60 25 64 22" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function UniIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 학사모 + 책 */}
      <path d="M60 15 L95 30 L60 45 L25 30 Z" fill={color} />
      <path d="M85 33 L85 50 Q85 55 80 55" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="80" cy="58" r="3" fill={color} />
      {/* 책 (페이퍼토이 변형) */}
      <path d="M30 70 L60 65 L90 70 L90 90 L30 90 Z" fill="white" stroke={color} strokeWidth="1.5" />
      <path d="M60 65 L60 90" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d="M40 75 L55 73" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M40 80 L55 78" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M65 73 L80 75" stroke={color} strokeWidth="1" opacity="0.5" />
      <path d="M65 78 L80 80" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function MuseumIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 박물관 — 그리스 신전 형태 */}
      <path d="M20 35 L60 15 L100 35 L100 40 L20 40 Z" fill={color} />
      <rect x="25" y="40" width="8" height="40" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="40" y="40" width="8" height="40" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="55" y="40" width="8" height="40" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="70" y="40" width="8" height="40" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="85" y="40" width="8" height="40" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="20" y="80" width="80" height="6" fill={color} />
      {/* 종이 모형 도토리 */}
      <ellipse cx="60" cy="92" rx="6" ry="4" fill={color} opacity="0.6" />
    </svg>
  );
}

function CityIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 도시 스카이라인 — 종이 접기 빌딩 */}
      <path d="M10 80 L25 80 L25 50 L40 50 L40 30 L55 30 L55 60 L70 60 L70 40 L85 40 L85 65 L100 65 L100 80 L110 80 L110 90 L10 90 Z"
        fill="white" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {/* 접힘선 */}
      <line x1="25" y1="50" x2="25" y2="80" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="40" y1="30" x2="40" y2="80" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <line x1="70" y1="40" x2="70" y2="80" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      {/* 창문 */}
      <rect x="30" y="58" width="5" height="5" fill={color} opacity="0.5" />
      <rect x="45" y="40" width="5" height="5" fill={color} opacity="0.5" />
      <rect x="75" y="50" width="5" height="5" fill={color} opacity="0.5" />
      {/* 캐릭터 머리 */}
      <circle cx="60" cy="20" r="10" fill={color} />
      <circle cx="57" cy="18" r="1.5" fill="white" />
      <circle cx="63" cy="18" r="1.5" fill="white" />
    </svg>
  );
}

function CharacterIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 캐릭터 페이퍼토이 — 전개도 형태 */}
      <path d="M40 25 L80 25 L85 50 L35 50 Z" fill="white" stroke={color} strokeWidth="1.5" />
      <path d="M30 50 L90 50 L88 80 L32 80 Z" fill="white" stroke={color} strokeWidth="1.5" />
      <path d="M40 25 L50 15 L70 15 L80 25" fill={color} opacity="0.4" stroke={color} strokeWidth="1.5" />
      {/* 점선 접힘 */}
      <line x1="35" y1="50" x2="85" y2="50" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      {/* 눈 */}
      <circle cx="50" cy="40" r="3" fill={color} />
      <circle cx="70" cy="40" r="3" fill={color} />
      {/* 다리 */}
      <rect x="42" y="80" width="10" height="14" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="68" y="80" width="10" height="14" fill="white" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function GenericIllust({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 100" className="w-32 h-32" fill="none">
      {/* 정육면체 전개도 */}
      <rect x="30" y="20" width="25" height="25" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="55" y="20" width="25" height="25" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="55" y="45" width="25" height="25" fill="white" stroke={color} strokeWidth="1.5" />
      <rect x="80" y="45" width="25" height="25" fill="white" stroke={color} strokeWidth="1.5" />
      <line x1="55" y1="20" x2="55" y2="70" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="80" y1="45" x2="80" y2="70" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────
 * PatentBadge
 * "특허 11종" 의 신뢰 신호를 시각화. 종이 인증서 미니어처.
 * ────────────────────────────────────────────────── */
export function PatentBadge({
  number,
  title,
  className = "",
}: {
  number: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm ${className}`}
    >
      {/* 종이 접힘 리본 효과 */}
      <div
        className="absolute top-0 right-0 w-0 h-0"
        style={{
          borderTop: "16px solid #F5C518",
          borderLeft: "16px solid transparent",
          borderTopRightRadius: "12px",
        }}
        aria-hidden
      />
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F5C518, #F4A009)" }}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
          <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3.5L6 20l1.5-6.5L3 9l6-1z" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          KIPO Patent
        </div>
        <div className="text-sm font-bold text-slate-900">{number}</div>
        <div className="text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>{title}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────
 * BlogThumbnail
 * 블로그 글의 emoji 가 비어있을 때 사용하는 태그별 일러스트.
 * 글 카드의 시각적 일관성을 유지하면서 이모지 의존을 제거.
 * ────────────────────────────────────────────────── */

export type BlogThumbVariant = "case" | "education" | "process" | "story" | "design" | "material";

export function BlogThumbnail({
  variant,
  className = "",
}: {
  variant: BlogThumbVariant;
  className?: string;
}) {
  const accents: Record<BlogThumbVariant, { bg: string; fg: string }> = {
    case:       { bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)", fg: "#E91E8C" }, // 사례 연구 - 핑크
    education:  { bg: "linear-gradient(135deg,#fef3c7,#fde68a)", fg: "#D97706" }, // 교육 - 앰버
    process:    { bg: "linear-gradient(135deg,#cffafe,#a5f3fc)", fg: "#0891B2" }, // 제작 과정 - 시안
    story:      { bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", fg: "#7C3AED" }, // 이야기 - 바이올렛
    design:     { bg: "linear-gradient(135deg,#fae8ff,#f5d0fe)", fg: "#A21CAF" }, // 디자인 - 푸시아
    material:   { bg: "linear-gradient(135deg,#dcfce7,#bbf7d0)", fg: "#16A34A" }, // 소재 - 그린
  };
  const c = accents[variant];

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: c.bg }}
      aria-hidden
    >
      {/* 배경 전개도 패턴 */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
        <rect x="60" y="20" width="50" height="40" fill="none" stroke={c.fg} strokeWidth="1" strokeDasharray="3 3" />
        <rect x="30" y="60" width="30" height="60" fill="none" stroke={c.fg} strokeWidth="1" strokeDasharray="3 3" />
        <rect x="60" y="60" width="50" height="60" fill="none" stroke={c.fg} strokeWidth="1" strokeDasharray="3 3" />
        <rect x="110" y="60" width="30" height="60" fill="none" stroke={c.fg} strokeWidth="1" strokeDasharray="3 3" />
        <rect x="60" y="120" width="50" height="40" fill="none" stroke={c.fg} strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* variant 별 메인 일러스트 */}
      <div className="relative z-10">
        {variant === "case" && <BlogCaseIllust color={c.fg} />}
        {variant === "education" && <BlogEduIllust color={c.fg} />}
        {variant === "process" && <BlogProcessIllust color={c.fg} />}
        {variant === "story" && <BlogStoryIllust color={c.fg} />}
        {variant === "design" && <BlogDesignIllust color={c.fg} />}
        {variant === "material" && <BlogMaterialIllust color={c.fg} />}
      </div>
    </div>
  );
}

function BlogCaseIllust({ color }: { color: string }) {
  // 데이터 차트 + 페이퍼토이
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <rect x="20" y="60" width="14" height="40" fill="white" stroke={color} strokeWidth="2"/>
      <rect x="40" y="40" width="14" height="60" fill="white" stroke={color} strokeWidth="2"/>
      <rect x="60" y="50" width="14" height="50" fill="white" stroke={color} strokeWidth="2"/>
      <rect x="80" y="25" width="14" height="75" fill={color} stroke={color} strokeWidth="2"/>
      <line x1="14" y1="100" x2="100" y2="100" stroke={color} strokeWidth="2"/>
      {/* 페이퍼토이 캐릭터 */}
      <g transform="translate(125,55)">
        <path d="M-15 -5 L15 -5 L17 35 L-17 35 Z" fill="white" stroke={color} strokeWidth="1.5"/>
        <path d="M-15 -5 L-8 -18 L8 -18 L15 -5 Z" fill={color} stroke={color} strokeWidth="1.5"/>
        <circle cx="-5" cy="8" r="1.5" fill="white"/><circle cx="5" cy="8" r="1.5" fill="white"/>
      </g>
    </svg>
  );
}

function BlogEduIllust({ color }: { color: string }) {
  // 학사모 + 책
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <path d="M80 20 L120 35 L80 50 L40 35 Z" fill={color}/>
      <path d="M105 38 L105 58 Q105 65 100 65" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="100" cy="68" r="3" fill={color}/>
      <path d="M40 70 L80 65 L120 70 L120 100 L40 100 Z" fill="white" stroke={color} strokeWidth="2"/>
      <line x1="80" y1="65" x2="80" y2="100" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7"/>
      <line x1="50" y1="78" x2="72" y2="76" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="50" y1="86" x2="72" y2="84" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="88" y1="76" x2="110" y2="78" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="88" y1="84" x2="110" y2="86" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}

function BlogProcessIllust({ color }: { color: string }) {
  // 톱니바퀴 + 페이퍼 접기
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <g transform="translate(50,60)">
        <circle cx="0" cy="0" r="22" fill="white" stroke={color} strokeWidth="2"/>
        <circle cx="0" cy="0" r="8" fill={color}/>
        {[0,45,90,135,180,225,270,315].map((deg) => (
          <rect key={deg} x="-3" y="-30" width="6" height="10" fill={color} transform={`rotate(${deg})`} />
        ))}
      </g>
      <g transform="translate(110,60)">
        <path d="M-20 -25 L20 -25 L25 25 L-25 25 Z" fill="white" stroke={color} strokeWidth="2"/>
        <path d="M-20 -25 L-10 -38 L10 -38 L20 -25 Z" fill={color} stroke={color} strokeWidth="2"/>
        <line x1="-20" y1="-25" x2="20" y2="-25" stroke={color} strokeWidth="1" strokeDasharray="3 3"/>
      </g>
      <path d="M75 60 L90 60" stroke={color} strokeWidth="2" markerEnd="url(#arr-p)"/>
      <defs><marker id="arr-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={color}/></marker></defs>
    </svg>
  );
}

function BlogStoryIllust({ color }: { color: string }) {
  // 말풍선 + 종이
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <path d="M30 35 L100 35 Q110 35 110 45 L110 75 Q110 85 100 85 L55 85 L40 100 L45 85 L30 85 Q20 85 20 75 L20 45 Q20 35 30 35 Z"
        fill="white" stroke={color} strokeWidth="2"/>
      <circle cx="45" cy="60" r="3" fill={color}/>
      <circle cx="65" cy="60" r="3" fill={color}/>
      <circle cx="85" cy="60" r="3" fill={color}/>
      <g transform="translate(130,75)">
        <rect x="-15" y="-15" width="30" height="35" fill={color} stroke={color} strokeWidth="1.5"/>
        <rect x="-12" y="-12" width="24" height="29" fill="white"/>
        <line x1="-8" y1="-5" x2="8" y2="-5" stroke={color} strokeWidth="1"/>
        <line x1="-8" y1="0" x2="8" y2="0" stroke={color} strokeWidth="1"/>
        <line x1="-8" y1="5" x2="6" y2="5" stroke={color} strokeWidth="1"/>
      </g>
    </svg>
  );
}

function BlogDesignIllust({ color }: { color: string }) {
  // 컴퍼스 + 곡선
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <circle cx="80" cy="60" r="40" fill="white" stroke={color} strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
      <path d="M80 25 L60 95 L100 95 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="2"/>
      <line x1="80" y1="25" x2="80" y2="95" stroke={color} strokeWidth="1.5"/>
      <circle cx="80" cy="25" r="4" fill={color}/>
      <circle cx="60" cy="95" r="2.5" fill={color}/>
      <circle cx="100" cy="95" r="2.5" fill={color}/>
    </svg>
  );
}

function BlogMaterialIllust({ color }: { color: string }) {
  // 잎사귀 (친환경 소재)
  return (
    <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none">
      <path d="M40 80 Q80 30 130 40 Q120 90 60 100 Q50 95 40 80 Z" fill={color} opacity="0.25" stroke={color} strokeWidth="2"/>
      <path d="M50 90 Q90 50 130 40" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M70 75 Q90 55 110 60" stroke={color} strokeWidth="1" fill="none"/>
      <path d="M60 85 Q80 65 105 70" stroke={color} strokeWidth="1" fill="none"/>
    </svg>
  );
}

/**
 * 태그 → BlogThumbnail variant 매핑 헬퍼.
 */
export function blogVariantFromTag(tag: string): BlogThumbVariant {
  switch (tag) {
    case "사례 연구":   return "case";
    case "교육":          return "education";
    case "제작 과정":   return "process";
    case "이야기":       return "story";
    case "디자인":       return "design";
    case "소재":          return "material";
    default:                return "story";
  }
}

/* ──────────────────────────────────────────────────
 * PaperNetBg
 * 섹션 배경용 전개도 패턴 (반복 가능)
 * ────────────────────────────────────────────────── */
export function PaperNetBg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 350"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="100" y="0" width="220" height="100" fill="rgba(255,255,255,0.04)" />
      <rect x="0" y="100" width="100" height="150" fill="rgba(255,255,255,0.04)" />
      <rect x="100" y="100" width="220" height="150" fill="rgba(255,255,255,0.04)" />
      <rect x="320" y="100" width="100" height="150" fill="rgba(255,255,255,0.04)" />
      <rect x="420" y="100" width="220" height="150" fill="rgba(255,255,255,0.04)" />
      <rect x="100" y="250" width="220" height="100" fill="rgba(255,255,255,0.04)" />

      <path
        d="M 100,0 H 320 V 100 H 420 V 250 H 320 V 350 H 100 V 250 H 0 V 100 H 100 Z"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="420" y="100" width="220" height="150" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="rgba(255,255,255,0.04)" />

      {/* fold lines */}
      <line x1="100" y1="100" x2="320" y2="100" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="10 7" />
      <line x1="100" y1="250" x2="320" y2="250" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="10 7" />
      <line x1="100" y1="100" x2="100" y2="250" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="10 7" />
      <line x1="320" y1="100" x2="320" y2="250" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="10 7" />
      <line x1="420" y1="100" x2="420" y2="250" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="10 7" />
    </svg>
  );
}
