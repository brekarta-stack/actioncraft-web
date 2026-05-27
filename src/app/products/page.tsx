import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_META, SITE_URL, SITE_NAME, BRAND_TAGLINE_KR } from "@/lib/site";
import {
  PaperToyIcon,
  SparkleIcon,
  CheckIcon,
  ArrowRightIcon,
  BoxIcon,
  GearIcon,
  EducationIcon,
  PencilIcon,
  type IconKey,
} from "@/components/icons";
import { PortfolioPlaceholder, PaperNetBg } from "@/components/paper-art";

export const metadata: Metadata = {
  title: PAGE_META.products.title,
  description: PAGE_META.products.description,
  alternates: { canonical: "/products" },
  openGraph: {
    title: PAGE_META.products.title,
    description: PAGE_META.products.description,
    url: "/products",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_META.products.title,
    description: PAGE_META.products.description,
  },
};

/**
 * /products 페이지용 Service JSON-LD.
 */
function ProductsServiceJsonLd() {
  const services = [
    {
      name: "페이퍼 크래프트 주문 제작",
      description: "특허 기반 도형·내각 원리 자기 구조 설계 페이퍼 크래프트 외주 제작",
    },
    {
      name: "액션 페이퍼 주문 제작",
      description: "정교한 종이 메커니즘으로 실제로 움직이는 캐릭터 액션 페이퍼 제작",
    },
    {
      name: "팝업북 주문 제작",
      description: "다층 팝업 구조 카드·북·포스터 형태의 팝업북 제작",
    },
    {
      name: "폼보드(우드락) 크래프트 제작",
      description: "전시·행사·인테리어용 대형 폼보드 입체 구조물 제작",
    },
  ];

  const data = services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "KR",
    serviceType: "주문 제작",
  }));

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ────────────── 데이터 ────────────── */

const products: {
  icon: IconKey;
  name: string;
  subtitle: string;
  accent: string;
  bgGradient: string;
  highlight: string;
  description: string;
  features: string[];
  minOrder: string;
  leadTime: string;
  useCase: string;
}[] = [
  {
    icon: "paperToy",
    name: "Paper Craft",
    subtitle: "페이퍼 크래프트",
    accent: "#06C6C8",
    bgGradient: "from-cyan-50 to-sky-50",
    highlight: "핵심 서비스",
    description:
      "도형·내각 원리를 이용해 종이만으로 입체 구조를 완성하는 특허 기반 페이퍼 크래프트. 치환·연결 원리를 응용해 무한한 형태 변주가 가능하며, 기관·기업 맞춤 대량 제작이 가능합니다.",
    features: [
      "도형·내각 원리 기반 입체 구조",
      "치환·연결 원리 응용 설계",
      "무게중심·중력 자동 기립",
      "기관·관공서·기업 맞춤 제작",
      "친환경 종이 소재",
      "OPP/벌크 포장 선택",
    ],
    minOrder: "1,000부",
    leadTime: "약 4주",
    useCase: "기관, 기업, 관공서",
  },
  {
    icon: "gear",
    name: "Action Paper",
    subtitle: "액션 페이퍼",
    accent: "#1E22B2",
    bgGradient: "from-blue-50 to-indigo-50",
    highlight: "특허 핵심 기술",
    description:
      "정교한 종이 메커니즘으로 실제로 움직이는 캐릭터 페이퍼. 고개를 끄덕이거나 팔을 흔드는 등 5가지 기본 움직임 타입으로 브랜드 캐릭터에 생동감을 부여합니다.",
    features: [
      "5가지 기본 움직임 타입",
      "캐릭터 IP 활용 가능",
      "움직임형·고정형 선택",
      "홍보·전시 활용 최적",
      "대량 생산 가능",
      "브랜드 굿즈 제작",
    ],
    minOrder: "1,000부",
    leadTime: "약 4주",
    useCase: "기업, 브랜드, 이벤트",
  },
  {
    icon: "sparkle",
    name: "Popup Book",
    subtitle: "팝업북",
    accent: "#E91E8C",
    bgGradient: "from-pink-50 to-fuchsia-50",
    highlight: "선물·기념품 인기",
    description:
      "펼치면 살아 숨쉬는 다층 팝업 구조. 카드·북·포스터 등 다양한 형태로 제작 가능하며 고급 선물·기념품·기업 프로모션으로 최적입니다.",
    features: [
      "다층 팝업 구조 설계",
      "카드·북·포스터 형태",
      "고급 선물·기념품 제작",
      "기업 프로모션 활용",
      "커스텀 문구 삽입",
      "소량 맞춤 제작 가능",
    ],
    minOrder: "300부",
    leadTime: "약 3주",
    useCase: "선물, 기념품, 이벤트",
  },
  {
    icon: "box",
    name: "Foamboard Craft",
    subtitle: "폼보드 크래프트",
    accent: "#F5C518",
    bgGradient: "from-amber-50 to-yellow-50",
    highlight: "전시·행사 특화",
    description:
      "폼보드·우드락 소재로 제작하는 대형 입체 구조물. 전시·행사·인테리어 소품으로 적합하며 임팩트 있는 공간 연출이 가능합니다.",
    features: [
      "대형 입체 구조 제작",
      "전시·행사 소품 최적",
      "공간 인테리어 활용",
      "라이트박스 연동 가능",
      "조립식으로 이동 용이",
      "경량 소재 사용",
    ],
    minOrder: "협의",
    leadTime: "협의",
    useCase: "전시, 행사, 인테리어",
  },
];

const processSteps: { num: string; icon: IconKey; label: string; detail: string; period: string; color: string }[] = [
  { num: "01", icon: "education", label: "상담 및 기획",       detail: "생산할 제품 종류 및 수량 결정",       period: "약 1주",    color: "#06C6C8" },
  { num: "02", icon: "gear",      label: "구조 설계 & 샘플링", detail: "컨셉에 맞는 최적 움직임 설계 및 샘플링", period: "약 1주",    color: "#F5C518" },
  { num: "03", icon: "pencil",    label: "디자인 작업",         detail: "고객사 피드백 반영 및 완성",           period: "약 1.5주",  color: "#E91E8C" },
  { num: "04", icon: "box",       label: "생산 및 납품",         detail: "공정 기반 생산, 패키징 및 검수 후 납품", period: "일정 협의", color: "#1E22B2" },
];

const orderOptions = [
  { category: "포장방식", options: ["OPP 포장", "벌크 포장"] },
  { category: "형태",       options: ["움직임형", "고정형"] },
  { category: "조립방식",   options: ["점착 (풀 필요)", "끼우기 (풀 없이)"] },
];

const projectWorks: { client: string; character: string; type: string; variant: "department" | "university" | "museum" | "city" | "character" | "generic" }[] = [
  { client: "경주박물관", character: "도토리 캐릭터",   type: "캐릭터 굿즈",   variant: "museum" },
  { client: "현대백화점", character: "스마일리",         type: "페이퍼 토이",   variant: "department" },
  { client: "KAIST",       character: "납육이",            type: "교육 굿즈",     variant: "university" },
  { client: "수원시",      character: "수원이",            type: "지자체 굿즈",   variant: "city" },
  { client: "공주시",      character: "고마곰·공주",       type: "캐릭터 굿즈",   variant: "character" },
  { client: "나주시",      character: "나주배 캐릭터",     type: "지역 특산물",   variant: "generic" },
];

function ProductIcon({ name, size = 48 }: { name: IconKey; size?: number }) {
  switch (name) {
    case "paperToy":  return <PaperToyIcon size={size} />;
    case "sparkle":   return <SparkleIcon size={size} />;
    case "gear":      return <GearIcon size={size} />;
    case "box":       return <BoxIcon size={size} />;
    case "education": return <EducationIcon size={size} />;
    case "pencil":    return <PencilIcon size={size} />;
    default:          return <PaperToyIcon size={size} />;
  }
}

export default function ProductsPage() {
  return (
    <>
      <ProductsServiceJsonLd />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -right-32 top-1/4 w-[70%] max-w-3xl rotate-6">
            <PaperNetBg className="w-full h-auto" />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full mb-6 bg-white/10 text-white border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Services · {BRAND_TAGLINE_KR}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]" style={{ wordBreak: "keep-all" }}>
            페이퍼 엔지니어링 <br className="md:hidden" />
            <span className="pe-gradient-text">주문 제작 서비스</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto" style={{ wordBreak: "keep-all" }}>
            Paper Engineering · Education Program · Editorial Design
            <br />
            <span className="text-blue-300 text-base">특허 기술 기반, 기획부터 납품까지 원스톱 제작.</span>
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <div
                key={product.name}
                className="pe-paper-lift bg-white border border-slate-100 rounded-2xl overflow-hidden pe-paper-shadow"
              >
                <div className={`bg-gradient-to-br ${product.bgGradient} h-44 flex items-center justify-center relative`}>
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center pe-paper-shadow"
                    style={{ background: "white", color: product.accent }}
                    aria-hidden
                  >
                    <ProductIcon name={product.icon} size={40} />
                  </div>
                  <span
                    className="absolute top-4 right-4 text-xs px-2.5 py-1 bg-white/90 text-slate-700 font-semibold rounded-full border border-slate-200"
                    style={{ wordBreak: "keep-all" }}
                  >
                    {product.highlight}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-400 font-medium mb-0.5">{product.name}</div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{product.subtitle}</h3>
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                      style={{ background: product.accent + "18", color: product.accent }}
                    >
                      {product.useCase.split(",")[0]}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4" style={{ wordBreak: "keep-all" }}>
                    {product.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5 mb-5">
                    {product.features.map((f) => (
                      <li key={f} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckIcon size={14} className="flex-shrink-0 mt-0.5" style={{ color: product.accent }} />
                        <span style={{ wordBreak: "keep-all" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-4 text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100">
                    <span>최소 <strong className="text-slate-800 pe-num">{product.minOrder}</strong></span>
                    <span className="text-slate-300">·</span>
                    <span>납기 <strong className="text-slate-800 pe-num">{product.leadTime}</strong></span>
                  </div>
                  <Link
                    href="/quote"
                    className="group block text-center py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${product.accent}, ${product.accent}cc)` }}
                  >
                    <span className="inline-flex items-center gap-1">
                      이 서비스 견적 받기
                      <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Works */}
      <section className="py-16 md:py-20" style={{ background: "#F0F2FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#06C6C8" }}>
              Recent Projects
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">제작 사례</h2>
            <p className="text-slate-500" style={{ wordBreak: "keep-all" }}>
              국내 주요 기관·기업과 함께한 페이퍼 엔지니어링 프로젝트.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {projectWorks.map((w) => (
              <div key={w.client} className="aspect-square">
                <PortfolioPlaceholder
                  variant={w.variant}
                  label={`${w.client} · ${w.character}`}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E91E8C" }}>
              Process
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              페이퍼 엔지니어링 주문 제작 프로세스
            </h2>
            <p className="text-slate-500">
              대부분의 제품은 <strong style={{ color: "#1E22B2" }}>약 4주 내 납품</strong> 가능합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {processSteps.map((s) => (
              <div key={s.num} className="pe-paper-lift bg-white border border-slate-100 rounded-2xl p-6 pe-paper-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white pe-num text-lg flex-shrink-0"
                    style={{ background: s.color }}
                    aria-hidden
                  >
                    {s.num}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold" style={{ color: s.color }}>{s.period}</div>
                    <div className="font-bold text-slate-900">{s.label}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-500" style={{ wordBreak: "keep-all" }}>{s.detail}</p>
              </div>
            ))}
          </div>

          {/* Order Options */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-5 text-center tracking-tight">
              주문 제작 시 선택 사항
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {orderOptions.map((opt) => (
                <div key={opt.category} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700 mb-3">{opt.category}</div>
                  <div className="flex flex-wrap gap-2">
                    {opt.options.map((o) => (
                      <span
                        key={o}
                        className="text-xs px-3 py-1.5 rounded-lg border"
                        style={{ background: "#F0F2FF", color: "#1E22B2", borderColor: "#dee1ff" }}
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-4" style={{ wordBreak: "keep-all" }}>
              움직임 선택 시 조립에 풀이 필요하며, 고정형은 풀 없이 끼우는 방식으로 제작 가능합니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 relative overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-2xl"><PaperNetBg className="w-full h-auto" /></div>
          </div>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">프로젝트를 시작해볼까요?</h2>
          <p className="text-blue-200 mb-2" style={{ wordBreak: "keep-all" }}>
            최소 1,000부부터 대량 제작까지, 합리적인 가격으로 제공합니다.
          </p>
          <p className="text-blue-300 text-sm mb-8">자동 견적 폼을 통해 빠르게 견적을 받아보세요.</p>
          <Link
            href="/quote"
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 font-bold rounded-xl text-white text-lg shadow-xl shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
          >
            무료 견적 받기
            <ArrowRightIcon size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}
