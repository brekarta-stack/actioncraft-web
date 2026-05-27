/**
 * PE Studio 전용 SVG 아이콘 시스템.
 *
 * 디자인 원칙:
 * - 1.5px stroke, currentColor 로 색상 일관성
 * - 종이 접힘/구조 메타포를 미세하게 반영 (folded corner, layered shapes)
 * - 24x24 viewBox 표준, size prop 으로 조정
 * - 이모지(🎪 📐 🎭 ✏️ ...) 대체용으로 일관된 외형 보장
 */

import type { SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number;
}

function IconBase({
  size = 24,
  strokeWidth = 1.6,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ──────────────────────────────────────────────────
 * Patent / Award (🏅 대체)
 * ────────────────────────────────────────────────── */
export const PatentIcon = (p: IconProps) => (
  <IconBase {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M9 14l-2 7 5-3 5 3-2-7" />
    <path d="M9.5 9l2 2 3-4" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Globe / Network (🌐 대체)
 * ────────────────────────────────────────────────── */
export const GlobeIcon = (p: IconProps) => (
  <IconBase {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18z" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Science / STEAM (🔬 대체)
 * ────────────────────────────────────────────────── */
export const ScienceIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M9 3h6" />
    <path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
    <path d="M7.5 14h9" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Eco / Sustainable (🌱 대체)
 * ────────────────────────────────────────────────── */
export const LeafIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M21 4c-9 0-15 4-15 12c0 2 .5 4 1.5 5c8 0 13.5-5 13.5-13c0-1.5-.1-3-.4-4z" />
    <path d="M21 4C13 8 9 13 7 21" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Paper Toy / Action figure (🎪 🤖 대체)
 * 종이 접기로 만든 사람 형상 — 시그니처 아이콘
 * ────────────────────────────────────────────────── */
export const PaperToyIcon = (p: IconProps) => (
  <IconBase {...p}>
    {/* 머리 (접힌 종이) */}
    <path d="M9 4 L15 4 L16 8 L8 8 Z" />
    {/* 몸통 */}
    <path d="M7 8 L17 8 L16 16 L8 16 Z" />
    {/* 다리 */}
    <path d="M9 16 L9 21" />
    <path d="M15 16 L15 21" />
    {/* 팔 */}
    <path d="M7 10 L4 13" />
    <path d="M17 10 L20 13" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Geometry / Compass (📐 대체)
 * ────────────────────────────────────────────────── */
export const GeometryIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M12 2 L4 20 L20 20 Z" />
    <path d="M8 14 L16 14" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Character / Mask (🎭 대체)
 * ────────────────────────────────────────────────── */
export const CharacterIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M4 8c0-3 4-5 8-5s8 2 8 5v4c0 4-4 8-8 8s-8-4-8-8z" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="15" cy="11" r="1" fill="currentColor" />
    <path d="M9 15c1 1.5 4.5 1.5 6 0" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Pencil / Editorial (✏️ 대체)
 * ────────────────────────────────────────────────── */
export const PencilIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M16 3l5 5L8 21H3v-5z" />
    <path d="M14 5l5 5" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Building / Corporate (🏢 대체)
 * ────────────────────────────────────────────────── */
export const BuildingIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    <path d="M3 21h18" />
    <path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Box / Package (📦 대체)
 * ────────────────────────────────────────────────── */
export const BoxIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
    <path d="M3 7l9 4 9-4" />
    <path d="M12 11v10" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Gift (🎁 대체)
 * ────────────────────────────────────────────────── */
export const GiftIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M4 11h16v9H4z" />
    <path d="M2 7h20v4H2z" />
    <path d="M12 7v13" />
    <path d="M12 7c-2 0-4-1.5-4-3a2 2 0 0 1 4 0c0 1.5 0 3 0 3z" />
    <path d="M12 7c2 0 4-1.5 4-3a2 2 0 0 0-4 0c0 1.5 0 3 0 3z" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Education / Cap (🎓 🧠 대체)
 * ────────────────────────────────────────────────── */
export const EducationIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M2 9l10-5 10 5-10 5z" />
    <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    <path d="M22 9v6" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Gear / Mechanism (⚙️ 대체)
 * ────────────────────────────────────────────────── */
export const GearIcon = (p: IconProps) => (
  <IconBase {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Rocket / Launch (🚀 대체)
 * ────────────────────────────────────────────────── */
export const RocketIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M14 4c4 0 6 2 6 6c-1 6-6 10-10 11c-1-4 3-9 4-13z" />
    <path d="M10 14l-3 3-3-1l1-3z" />
    <circle cx="15" cy="9" r="1.5" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Sparkle / Creativity
 * ────────────────────────────────────────────────── */
export const SparkleIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * Arrow / Direction
 * ────────────────────────────────────────────────── */
export const ArrowRightIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </IconBase>
);

export const CheckIcon = (p: IconProps) => (
  <IconBase {...p}>
    <path d="M4 12l5 5L20 6" />
  </IconBase>
);

/* ──────────────────────────────────────────────────
 * 아이콘 키 → 컴포넌트 매핑 (페이지 데이터에서 문자열로 참조하도록)
 * ────────────────────────────────────────────────── */
export const ICONS = {
  patent: PatentIcon,
  globe: GlobeIcon,
  science: ScienceIcon,
  leaf: LeafIcon,
  paperToy: PaperToyIcon,
  geometry: GeometryIcon,
  character: CharacterIcon,
  pencil: PencilIcon,
  building: BuildingIcon,
  box: BoxIcon,
  gift: GiftIcon,
  education: EducationIcon,
  gear: GearIcon,
  rocket: RocketIcon,
  sparkle: SparkleIcon,
  arrowRight: ArrowRightIcon,
  check: CheckIcon,
} as const;

export type IconKey = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconKey } & IconProps) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
