import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_META, BRAND_TAGLINE_KR, SITE_SHORT, SITE_NAME } from "@/lib/site";
import {
  PatentIcon,
  GlobeIcon,
  EducationIcon,
  LeafIcon,
  CheckIcon,
  ArrowRightIcon,
  type IconKey,
} from "@/components/icons";
import { PatentBadge, PaperNetBg } from "@/components/paper-art";

export const metadata: Metadata = {
  title: PAGE_META.about.title,
  description: PAGE_META.about.description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: PAGE_META.about.title,
    description: PAGE_META.about.description,
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_META.about.title,
    description: PAGE_META.about.description,
  },
};

const stats: { num: string; sub?: string; label: string }[] = [
  { num: "11", sub: "종", label: "자기구조 설계 특허" },
  { num: "650+", label: "누적 납품 프로젝트" },
  { num: "국내 유일", label: "페이퍼 엔지니어링 스튜디오" },
  { num: "KAIST", label: "출신 개발 인력" },
];

const strengths: { icon: IconKey; title: string; description: string }[] = [
  {
    icon: "patent",
    title: "자기 구조 설계 특허 11종",
    description:
      "수많은 페이퍼 엔지니어링 설계 경험과 다수의 지식 재산권을 바탕으로, 국내 유일 수준의 구동형 페이퍼 모델 기술을 보유하고 있습니다.",
  },
  {
    icon: "globe",
    title: "세계 페이퍼 엔지니어 네트워크",
    description:
      "세계 각지의 페이퍼 엔지니어들과 교류하며 지속적으로 설계 메커니즘을 고도화합니다. PePaKuRa Designer 공식 교육 운영.",
  },
  {
    icon: "education",
    title: "KAIST 협력 개발",
    description:
      "KAIST 출신 개발자 및 교육 프로그램 개발진이 함께합니다. 과학적 원리를 기반으로 한 교육적 페이퍼 모델을 설계합니다.",
  },
  {
    icon: "leaf",
    title: "친환경 업사이클링",
    description:
      "친환경 재질로 만드는 캐릭터. 단순하게 표현하거나, 의미를 더해 훨씬 가치 있게 표현하는 것도 가능합니다.",
  },
];

const services = [
  {
    num: "01",
    title: "Paper Engineering",
    items: [
      "교육용·홍보용 캐릭터 종이 모형 외주 제작",
      "구동 가능 플랫폼 제공 및 캐릭터 디자인",
      "기관·관공서·기업 등 맞춤 제작",
      "친환경·업사이클링 활용 교구",
    ],
    accent: "#06C6C8",
  },
  {
    num: "02",
    title: "Education Program",
    items: [
      "방과 후 교육 프로그램 및 재료 판매",
      "업사이클링 교육 키트",
      "코딩 전자 교육 키트",
    ],
    accent: "#F5C518",
  },
  {
    num: "03",
    title: "Editorial Design",
    items: [
      "캐릭터 제작",
      "기관·관공서·기업 BI/CI 제작",
      "브로셔·PPT 등 편집 디자인",
    ],
    accent: "#E91E8C",
  },
];

const timeline = [
  { year: "2013", event: "Paper Engineering Studio 창업 — 국내 유일의 페이퍼 엔지니어링 전문 스튜디오 출범" },
  { year: "2015", event: "자기 구조 설계 특허 최초 등록, STEAM 교육 키트 출시" },
  { year: "2017", event: "국내 최대 페이퍼 토이 커뮤니티 '종이천하' 운영 시작" },
  { year: "2019", event: "누적 특허 11종 달성, KAIST 협력 교육 프로그램 개발" },
  { year: "2021", event: "현대백화점·경주박물관 등 주요 기관 납품 본격화" },
  { year: "2023", event: "누적 납품 650건 돌파, 기업 굿즈 서비스 확장" },
  { year: "2024", event: "온라인 견적 문의 서비스 론칭" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -right-32 top-1/4 w-[70%] max-w-3xl rotate-6">
            <PaperNetBg className="w-full h-auto" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full mb-6 bg-white/10 text-white border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              About {SITE_SHORT}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight" style={{ wordBreak: "keep-all" }}>
              {BRAND_TAGLINE_KR}<br />
              <span className="pe-gradient-text">PE Studio</span>입니다
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed" style={{ wordBreak: "keep-all" }}>
              디자인 프로세스와 디자인 씽킹을 바탕으로 Paper Engineering,
              Education Program, Editorial Design 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center md:text-left ${i === 0 ? "" : ""}`}>
                <div
                  className="pe-num text-3xl md:text-5xl mb-1 flex items-baseline gap-1 justify-center md:justify-start"
                  style={{ color: i === 0 ? "#1E22B2" : "#475569" }}
                >
                  {stat.num}
                  {stat.sub && <span className="text-xl md:text-2xl text-slate-500 font-bold">{stat.sub}</span>}
                </div>
                <div className={`text-xs md:text-sm ${i === 0 ? "text-slate-700 font-semibold" : "text-slate-500"}`} style={{ wordBreak: "keep-all" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#06C6C8" }}>
                Our Story
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">우리의 이야기</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                <p>
                  <strong className="text-slate-900">{SITE_NAME}(PE Studio)</strong>는
                  창의적 발상을 기반으로 디자이너 크루들이 모인 국내 유일의 페이퍼 엔지니어링 스튜디오입니다.
                </p>
                <p>
                  단순한 심미적 디자인을 넘어, 고객의 실제 니즈를 파악하여
                  최적화된 결과물을 제안하는 것이 저희의 방식입니다.
                </p>
                <p>
                  수많은 페이퍼 엔지니어링 설계 경험과 <strong className="text-slate-900">11종의 특허</strong>,
                  국내 유일의 종이 모델 디자이너 교육 시스템, KAIST 출신 개발 인력을 통해
                  국내 유일의 페이퍼 엔지니어링 스튜디오로 자리잡았습니다.
                </p>
                <p>
                  타업체와 비교해도 뛰어난 서비스와 합리적인 가격, 신속한 납품이 가능합니다.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-7 border border-blue-100 pe-paper-shadow">
              <h3 className="font-bold text-slate-900 mb-5 tracking-tight">핵심 역량</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  "자기 구조 설계 관련 11종의 특허 보유",
                  "국내 최대 페이퍼 토이 커뮤니티 '종이천하' 운영",
                  "국내 유일 PePaKuRa 설계 교육 프로그램 제공",
                  "KAIST 출신 개발자 및 교육 프로그램 개발",
                  "우수한 개발 인적 자원 보유",
                  "친환경 재질 및 업사이클링 소재 적용",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckIcon size={18} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                    <span style={{ wordBreak: "keep-all" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#E91E8C" }}>
              Differentiation
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">차별화 포인트</h2>
            <p className="text-slate-500" style={{ wordBreak: "keep-all" }}>
              국내 유일의 페이퍼 엔지니어링 스튜디오로서의 강점.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {strengths.map((s) => (
              <div key={s.title} className="pe-paper-lift flex gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white" style={{ background: "#1E22B2" }} aria-hidden>
                  {s.icon === "patent" && <PatentIcon size={24} />}
                  {s.icon === "globe" && <GlobeIcon size={24} />}
                  {s.icon === "education" && <EducationIcon size={24} />}
                  {s.icon === "leaf" && <LeafIcon size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed" style={{ wordBreak: "keep-all" }}>{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Patent badges */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
자기 구조 설계 특허 11종 보유 (KIPO 등록)
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PatentBadge number="설계 특허" title="자기구조 페이퍼토이 설계 방법" />
              <PatentBadge number="구조 특허" title="탄성 메커니즘 종이 모형 구조" />
              <PatentBadge number="외 9종" title="자기 구조 설계 특허군" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24" style={{ background: "#F0F2FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#1E22B2" }}>
              Services
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">제공 서비스</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div key={svc.num} className="pe-paper-lift bg-white rounded-2xl p-7 pe-paper-shadow border border-slate-100">
                <div className="pe-num text-2xl mb-2" style={{ color: svc.accent }}>{svc.num}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">{svc.title}</h3>
                <ul className="space-y-2.5">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon size={16} className="flex-shrink-0 mt-1" style={{ color: svc.accent }} />
                      <span style={{ wordBreak: "keep-all" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24" style={{ background: "#F0F2FF" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#1E22B2" }}>
              Timeline
            </p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">연혁</h2>
          </div>
          <div className="relative">
            <div
              className="absolute left-[68px] top-2 bottom-2 w-0.5"
              style={{ background: "linear-gradient(180deg, #06C6C8, #F5C518, #E91E8C)" }}
            />
            <div className="space-y-6">
              {timeline.map((item) => (
                <div key={item.year} className="flex gap-6 items-start">
                  <div className="w-12 text-right flex-shrink-0">
                    <span className="pe-num text-sm font-bold" style={{ color: "#1E22B2" }}>{item.year}</span>
                  </div>
                  <div className="relative flex-shrink-0 mt-1.5">
                    <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: "#1E22B2" }} />
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-700 text-sm" style={{ wordBreak: "keep-all" }}>{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            프로젝트를 함께 시작해볼까요?
          </h2>
          <p className="text-blue-200 mb-8" style={{ wordBreak: "keep-all" }}>
            아이디어가 있다면 언제든지 무료 견적을 요청해주세요.
          </p>
          <Link
            href="/quote"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl text-white text-lg shadow-xl shadow-pink-500/30 hover:-translate-y-0.5 transition-all"
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
