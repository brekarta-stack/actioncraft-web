import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_META, SITE_URL, SITE_NAME } from "@/lib/site";

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
 * 검색엔진에 "어떤 서비스를 제공하는가" 를 명시.
 */
function ProductsServiceJsonLd() {
  const services = [
    {
      name: "Action Paper Toy 주문 제작",
      description:
        "자기 구조 설계 특허를 기반으로 한 움직이는 페이퍼토이 외주 제작",
    },
    {
      name: "STEAM 교육 키트 제작",
      description:
        "수학·도형·과학 원리를 학습하는 페이퍼 기반 STEAM 교구 개발",
    },
    {
      name: "캐릭터 굿즈 주문 제작",
      description: "지자체·기관·기업 캐릭터 및 기념품 페이퍼토이 제작",
    },
    {
      name: "BI/CI 편집 디자인",
      description:
        "브랜드 아이덴티티 개발 및 브로셔·PPT 편집 디자인",
    },
  ];

  const data = services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
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

const products = [
  {
    emoji: "🎪",
    name: "Action Paper Toy",
    subtitle: "페이퍼 모델 엔지니어링",
    color: "from-orange-50 to-amber-50",
    badge: "bg-orange-100 text-orange-700",
    highlight: "핵심 서비스",
    description:
      "체계적이고 전문적인 설계에 의해 다양하게 움직이도록 고안된 종이 모형. 자기 구조 설계 특허 11종을 바탕으로 세계 아티스트들과 교류하며 메커니즘을 고도화합니다.",
    features: [
      "도형·내각 원리 기반 입체 구조",
      "무게중심·중력 원리 자동 기립",
      "교육용·홍보용 캐릭터 외주 제작",
      "구동 가능 플랫폼 제공",
      "기관·관공서·기업 맞춤 제작",
      "친환경·업사이클링 소재",
    ],
    minOrder: "1,000부",
    leadTime: "3~4주",
    useCase: "기관, 기업, 교육",
  },
  {
    emoji: "📚",
    name: "Education Program",
    subtitle: "교육 키트",
    color: "from-blue-50 to-sky-50",
    badge: "bg-blue-100 text-blue-700",
    highlight: "교육 기관 추천",
    description:
      "수학, 도형, 과학 등 기초 원리를 친근한 캐릭터로 자연스럽게 배우는 STEAM 교육 키트. KAIST 출신 개발자와 함께 만든 교육 콘텐츠입니다.",
    features: [
      "STEAM 기초 원리 학습",
      "방과 후 교육 프로그램",
      "업사이클링 교육 키트",
      "코딩 전자 교육 키트",
      "재료 별도 판매",
      "교육 프로그램 연계 가능",
    ],
    minOrder: "30세트",
    leadTime: "2~3주",
    useCase: "학교, 학원, 교육기관",
  },
  {
    emoji: "🎭",
    name: "Custom Character",
    subtitle: "캐릭터 & 굿즈",
    color: "from-green-50 to-emerald-50",
    badge: "bg-green-100 text-green-700",
    highlight: "관공서 납품 다수",
    description:
      "기관 기존 캐릭터 활용이 가능하며, 캐릭터가 없는 경우 개발해드립니다. 기념품, 축제, 체험상품 등 다양하게 활용 가능한 정교한 움직임의 굿즈.",
    features: [
      "기관·기업 기존 캐릭터 활용",
      "신규 캐릭터 개발 가능",
      "기념품·축제·체험상품",
      "기존 물량 대비 저렴한 대량 생산",
      "남녀노소 즐길 수 있는 디자인",
      "포장(OPP/벌크) 선택 가능",
    ],
    minOrder: "1,000부",
    leadTime: "3~4주",
    useCase: "지자체, 박물관, 문화재단",
  },
  {
    emoji: "✏️",
    name: "Editorial Design",
    subtitle: "편집 디자인",
    color: "from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
    highlight: "BI/CI 전문",
    description:
      "캐릭터 제작부터 기관·관공서·기업 BI/CI 개발, 브로셔·PPT 등 편집 디자인까지. 브랜드 아이덴티티를 일관성 있게 구축해드립니다.",
    features: [
      "캐릭터 디자인",
      "기관·기업 BI/CI 개발",
      "브로셔 · 리플렛 디자인",
      "PPT 템플릿 제작",
      "브랜드 가이드라인",
      "편집 디자인 일체",
    ],
    minOrder: "협의",
    leadTime: "2~3주",
    useCase: "기업, 기관, 스타트업",
  },
];

const processSteps = [
  {
    step: "01",
    icon: "💬",
    label: "상담 및 기획",
    detail: "생산할 제품 종류 및 수량 결정",
    period: "약 1주",
  },
  {
    step: "02",
    icon: "🔧",
    label: "구조 설계 & 샘플링",
    detail: "컨셉에 맞는 최적의 움직임 설계 및 샘플링",
    period: "약 1주",
  },
  {
    step: "03",
    icon: "🎨",
    label: "디자인 작업",
    detail: "고객사 피드백 반영 및 완성",
    period: "약 1.5주",
  },
  {
    step: "04",
    icon: "📦",
    label: "생산 및 납품",
    detail: "공정 기반 생산, 패키징 및 검수 후 납품",
    period: "일정 협의",
  },
];

const orderOptions = [
  {
    category: "포장방식",
    options: ["OPP 포장", "벌크 포장"],
  },
  {
    category: "형태",
    options: ["움직임형", "고정형"],
  },
  {
    category: "조립방식",
    options: ["점착 (풀 필요)", "끼우기 (풀 없이)"],
  },
];

const projectWorks = [
  { client: "경주박물관", character: "도토리 캐릭터", type: "캐릭터 굿즈" },
  { client: "현대백화점", character: "스마일리", type: "페이퍼 토이" },
  { client: "KAIST", character: "납육이", type: "교육 굿즈" },
  { client: "수원시", character: "수원이", type: "지자체 굿즈" },
  { client: "공주시", character: "고마곰·공주", type: "캐릭터 굿즈" },
  { client: "나주시", character: "나주배 캐릭터", type: "지역 특산물" },
];

export default function ProductsPage() {
  return (
    <>
      <ProductsServiceJsonLd />
      {/* Hero */}
      <section className="py-20 md:py-28" style={{ background: "#1E22B2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full mb-6">
            Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">서비스</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Paper Model Engineering · Education Program · Editorial Design<br />
            <span className="text-slate-400 text-base">특허 기술 기반, 기획부터 납품까지 원스톱 제작</span>
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product.name}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className={`bg-gradient-to-br ${product.color} h-44 flex items-center justify-center relative`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform">
                    {product.emoji}
                  </span>
                  <span className="absolute top-4 right-4 text-xs px-2.5 py-1 bg-white/80 text-slate-700 font-semibold rounded-full border border-slate-200">
                    {product.highlight}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-slate-400 font-medium mb-0.5">{product.name}</div>
                      <h3 className="text-xl font-bold text-slate-900">{product.subtitle}</h3>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${product.badge}`}>
                      {product.useCase.split(",")[0]}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5 mb-5">
                    {product.features.map((f) => (
                      <li key={f} className="text-xs text-slate-500 flex items-start gap-1">
                        <span className="text-orange-400 flex-shrink-0 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-4 text-sm text-slate-400 mb-4 pb-4 border-b border-slate-100">
                    <span>최소 <strong className="text-slate-700">{product.minOrder}</strong></span>
                    <span>·</span>
                    <span>납기 <strong className="text-slate-700">{product.leadTime}</strong></span>
                  </div>
                  <Link
                    href="/quote"
                    className="block text-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    이 서비스 견적 받기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Works */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">제작 사례</h2>
            <p className="text-slate-500">국내 주요 기관 및 기업과 함께한 프로젝트</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {projectWorks.map((w) => (
              <div key={w.client} className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-orange-300 hover:shadow-sm transition-all">
                <div className="text-2xl mb-2">🏛️</div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">{w.client}</div>
                <div className="text-xs text-slate-500 mb-1">{w.character}</div>
                <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full">{w.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">주문 제작 프로세스</h2>
            <p className="text-slate-500">
              대부분의 제품은 <strong className="text-orange-600">3~4주 내 납품</strong>이 가능합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {processSteps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] w-full h-0.5 bg-orange-100 z-0" />
                )}
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 text-white font-bold text-xl rounded-full mb-3 shadow-md">
                    {s.icon}
                  </div>
                  <div className="text-xs text-orange-500 font-semibold mb-1">{s.period}</div>
                  <div className="font-bold text-slate-900 mb-1">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Options */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 text-center">주문 제작 시 선택 사항</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {orderOptions.map((opt) => (
                <div key={opt.category} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700 mb-2">{opt.category}</div>
                  <div className="flex gap-2">
                    {opt.options.map((o) => (
                      <span key={o} className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-4">
              움직임 선택 시 조립에 풀이 필요하며, 고정형은 풀 없이 끼우는 방식으로 제작 가능합니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">프로젝트를 시작해볼까요?</h2>
          <p className="text-orange-100 mb-2">최소 1,000부부터 대량 제작까지, 합리적인 가격으로 제공합니다.</p>
          <p className="text-orange-200 text-sm mb-8">자동 견적 폼을 통해 빠르게 견적을 받아보세요.</p>
          <Link
            href="/quote"
            className="inline-block px-10 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors text-lg"
          >
            무료 견적 받기
          </Link>
        </div>
      </section>
    </>
  );
}

