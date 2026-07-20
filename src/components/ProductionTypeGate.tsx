"use client";

/**
 * /products 첫 단계 — [주문 제작 형태] 선택 게이트.
 *
 * 도면만 의뢰 / 제품 생산 → 아래에 기존 제품 선택(제품 종류별/용도별) 카탈로그 노출.
 * 완제품 의뢰 → 중간 화면 없이 /quote?consult=finished 로 직행 (연락처 단계 바로 랜딩).
 *
 * 선택은 ?type= URL 파라미터와 동기화되어 뒤로가기·딥링크가 자연스럽다.
 *   /products?type=blueprint | production
 *   (?type=finished 구 딥링크는 /quote?consult=finished 로 리다이렉트)
 *
 * ⚠️ useSearchParams 를 쓰지 않는 이유: /products 는 정적(SSG) 페이지라
 * useSearchParams + Suspense 조합이 fallback 에서 멈추는 문제가 있음
 * (/portfolio 에서 겪은 infinite-fallback 과 동일 계열).
 * → window.location + history.replaceState 로 직접 동기화한다.
 */

import { useEffect, useState, type ReactNode } from "react";
import { CheckIcon, ArrowRightIcon } from "@/components/icons";

type ProductionType = "blueprint" | "production" | "finished";

interface TypeOption {
  id: ProductionType;
  title: string;
  english: string;
  badge?: string;
  accent: string;
  bgTint: string;
  description: string;
  features: string[];
  /** 실제 사진으로 교체하고 싶을 때 URL 지정 — 없으면 SVG 일러스트 */
  image?: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    id: "blueprint",
    title: "도면만 의뢰",
    english: "Blueprint Only",
    accent: "#06C6C8",
    bgTint: "#E0FAFB",
    description:
      "구조 설계와 전개도 도면 파일만 납품받는 방식입니다. 인쇄·제작 시설을 갖추었거나 직접 만들고 싶은 분께 적합합니다.",
    features: ["전개도(도면) 파일 납품", "구조 설계·조립 테스트 포함", "인쇄·제작은 직접 진행"],
  },
  {
    id: "production",
    title: "제품 생산",
    english: "Full Production",
    badge: "대표 서비스",
    accent: "#1E22B2",
    bgTint: "#F0F2FF",
    description:
      "설계부터 디자인, 인쇄·후가공, 포장까지 완성된 제품으로 납품하는 방식입니다. 가장 많이 선택하는 방식입니다.",
    features: ["설계·디자인·생산 원스톱", "포장 방식 선택 가능", "검수 후 납품"],
  },
  {
    id: "finished",
    title: "완제품 의뢰",
    english: "Turn-key",
    badge: "상담 진행",
    accent: "#E91E8C",
    bgTint: "#FFF0F6",
    description:
      "인쇄물 조립·설치까지 마친 완성품 형태로 받는 방식입니다. 전시·행사 연출물이나 대형 조형물에 적합합니다.",
    features: ["조립 완료 상태로 납품", "전시·행사 설치물 대응", "담당자 상담으로 진행"],
  },
];

/* ────────── 형태별 SVG 일러스트 (image 미지정 시 기본) ────────── */

function BlueprintIllust() {
  return (
    <svg viewBox="0 0 240 130" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* 모눈종이 */}
      <rect x="20" y="14" width="200" height="102" rx="8" fill="white" stroke="#B5EFF0" strokeWidth="2" />
      {[40, 60, 80, 100, 120, 140, 160, 180, 200].map((x) => (
        <line key={x} x1={x} y1="16" x2={x} y2="114" stroke="#E0FAFB" strokeWidth="1" />
      ))}
      {[34, 54, 74, 94].map((y) => (
        <line key={y} x1="22" y1={y} x2="218" y2={y} stroke="#E0FAFB" strokeWidth="1" />
      ))}
      {/* 전개도 — 십자형 박스 넷 */}
      <g>
        <rect x="98" y="44" width="28" height="28" fill="#06C6C8" opacity="0.85" />
        <rect x="70" y="44" width="28" height="28" fill="#06C6C8" opacity="0.45" />
        <rect x="126" y="44" width="28" height="28" fill="#06C6C8" opacity="0.45" />
        <rect x="154" y="44" width="28" height="28" fill="#06C6C8" opacity="0.3" />
        <rect x="98" y="16" width="28" height="28" fill="#06C6C8" opacity="0.45" />
        <rect x="98" y="72" width="28" height="28" fill="#06C6C8" opacity="0.45" />
        {/* 접는 선 */}
        <line x1="98" y1="44" x2="98" y2="72" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="126" y1="44" x2="126" y2="72" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="98" y1="44" x2="126" y2="44" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="98" y1="72" x2="126" y2="72" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
      </g>
      {/* 연필 */}
      <g transform="rotate(35 195 95)">
        <rect x="186" y="88" width="34" height="8" rx="2" fill="#F5C518" />
        <polygon points="220,88 230,92 220,96" fill="#1E22B2" />
      </g>
    </svg>
  );
}

function ProductionIllust() {
  return (
    <svg viewBox="0 0 240 130" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* 인쇄 롤러 */}
      <rect x="52" y="22" width="136" height="34" rx="10" fill="#1E22B2" />
      <circle cx="76" cy="39" r="9" fill="#F0F2FF" />
      <circle cx="120" cy="39" r="9" fill="#F0F2FF" />
      <circle cx="164" cy="39" r="9" fill="#F0F2FF" />
      {/* 출력되는 시트 */}
      <rect x="70" y="58" width="100" height="14" rx="2" fill="#E0FAFB" stroke="#06C6C8" strokeWidth="1.5" />
      {/* 완성 스택 */}
      <rect x="62" y="88" width="116" height="10" rx="2" fill="#06C6C8" opacity="0.35" />
      <rect x="56" y="98" width="128" height="10" rx="2" fill="#06C6C8" opacity="0.55" />
      <rect x="50" y="108" width="140" height="10" rx="2" fill="#06C6C8" opacity="0.8" />
      {/* 화살표 */}
      <path d="M120 74 L120 84" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M115 80 L120 86 L125 80" stroke="#E91E8C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FinishedIllust() {
  return (
    <svg viewBox="0 0 240 130" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* 받침대 */}
      <rect x="60" y="104" width="120" height="10" rx="4" fill="#FDE0EF" />
      {/* 조립 완성 입체 박스 (아이소메트릭) */}
      <g>
        <polygon points="120,28 162,48 120,68 78,48" fill="#E91E8C" opacity="0.9" />
        <polygon points="78,48 120,68 120,104 78,84" fill="#E91E8C" opacity="0.6" />
        <polygon points="162,48 120,68 120,104 162,84" fill="#E91E8C" opacity="0.75" />
        {/* 리본 */}
        <line x1="99" y1="38" x2="141" y2="58" stroke="#F5C518" strokeWidth="4" />
        <line x1="99" y1="94" x2="99" y2="58" stroke="#F5C518" strokeWidth="4" opacity="0.85" />
      </g>
      {/* 반짝임 */}
      <g fill="#F5C518">
        <path d="M52 34 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
        <path d="M186 26 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 z" opacity="0.8" />
        <circle cx="176" cy="92" r="3.5" opacity="0.7" />
      </g>
    </svg>
  );
}

function TypeIllust({ id }: { id: ProductionType }) {
  if (id === "blueprint") return <BlueprintIllust />;
  if (id === "production") return <ProductionIllust />;
  return <FinishedIllust />;
}

/* ────────── 완제품 의뢰 — 별도 프로세스 안내 패널 ────────── */
/* ────────── 메인 게이트 ────────── */

/** 완제품 의뢰는 게이트에 머물지 않고 제작 문의 연락처 단계로 직행 */
const FINISHED_CONSULT_URL = "/quote?consult=finished";

function parseType(search: string): Exclude<ProductionType, "finished"> | null {
  const t = new URLSearchParams(search).get("type");
  return t === "blueprint" || t === "production" ? t : null;
}

export default function ProductionTypeGate({ children }: { children: ReactNode }) {
  // SSR 은 항상 미선택(3택 카드) 상태로 렌더 — 카드 콘텐츠가 정적 HTML 에 포함돼 SEO 에도 유리.
  // 딥링크(?type=...)는 마운트 직후 클라이언트에서 반영.
  const [selected, setSelected] = useState<Exclude<ProductionType, "finished"> | null>(null);

  useEffect(() => {
    // 구 딥링크 호환 — ?type=finished 는 상담 직행으로 승격
    if (new URLSearchParams(window.location.search).get("type") === "finished") {
      window.location.replace(FINISHED_CONSULT_URL);
      return;
    }
    const read = () => setSelected(parseType(window.location.search));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  function pick(type: ProductionType | null) {
    // 완제품 의뢰 — 중간 화면 없이 제작 문의(연락처 단계)로 바로 이동
    if (type === "finished") {
      window.location.href = FINISHED_CONSULT_URL;
      return;
    }
    setSelected(type);
    const url = new URL(window.location.href);
    if (type) {
      // 선택은 히스토리에 쌓아 브라우저 뒤로가기 = 형태 다시 선택으로 복귀
      url.searchParams.set("type", type);
      window.history.pushState(null, "", url.toString());
    } else {
      url.searchParams.delete("type");
      window.history.replaceState(null, "", url.toString());
    }
  }

  const selectedOption = TYPE_OPTIONS.find((o) => o.id === selected);

  /* ── 선택 완료 상태 — 콤팩트 확인 바 + 다음 단계 ── */
  if (selected && selectedOption) {
    return (
      <>
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white flex-shrink-0"
                style={{ background: selectedOption.accent }}
                aria-hidden
              >
                <CheckIcon size={18} strokeWidth={2.5} />
              </span>
              <div>
                <div className="text-xs text-slate-400 font-medium">주문 제작 형태</div>
                <div className="font-bold text-slate-900">{selectedOption.title}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => pick(null)}
              className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-[#1E22B2] hover:text-[#1E22B2] transition-colors font-medium"
            >
              형태 변경
            </button>
          </div>
        </div>

        {children}
      </>
    );
  }

  /* ── 미선택 상태 — 3택 카드 ── */
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E91E8C" }}>
            Step 1 · 주문 제작 형태
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            어떤 형태로 받아보시겠어요?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto" style={{ wordBreak: "keep-all" }}>
            납품 범위에 따라 세 가지 방식 중 하나를 선택하세요.
            선택 후 제품 종류를 고르실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              className="pe-paper-lift group text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-[var(--accent)] overflow-hidden pe-paper-shadow transition-colors flex flex-col"
              style={{ "--accent": opt.accent } as React.CSSProperties}
              aria-label={`${opt.title} 선택`}
            >
              {/* 상단 일러스트/이미지 */}
              <div className="aspect-[2/1] relative overflow-hidden" style={{ background: opt.bgTint }}>
                {opt.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={opt.image}
                    alt={`${opt.title} 안내 이미지`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 p-3 transition-transform duration-500 group-hover:scale-[1.04]">
                    <TypeIllust id={opt.id} />
                  </div>
                )}
                {opt.badge && (
                  <span
                    className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full font-bold text-white shadow-sm"
                    style={{ background: opt.accent }}
                  >
                    {opt.badge}
                  </span>
                )}
              </div>

              {/* 본문 */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-2">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                    {opt.english}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{opt.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4" style={{ wordBreak: "keep-all" }}>
                  {opt.description}
                </p>
                <ul className="space-y-1.5 mb-5">
                  {opt.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckIcon size={15} className="flex-shrink-0 mt-0.5" style={{ color: opt.accent }} />
                      <span style={{ wordBreak: "keep-all" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <span
                  className="mt-auto inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg text-white transition-opacity group-hover:opacity-90"
                  style={{ background: opt.accent }}
                >
                  이 형태로 진행
                  <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
