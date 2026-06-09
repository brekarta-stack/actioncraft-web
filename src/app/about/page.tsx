import type { Metadata } from "next";
import Link from "next/link";
import { PAGE_META, BRAND_TAGLINE_KR, SITE_NAME } from "@/lib/site";
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
  { num: "2", sub: "회", label: "문화체육관광부 장관상" },
  { num: "지기구조", label: "전문 설계 스튜디오" },
];

const strengths: { icon: IconKey; title: string; description: string }[] = [
  {
    icon: "patent",
    title: "막다른 길마다 남긴 특허",
    description:
      "움직이는 종이는 한 번 길을 찾기까지가 오래 걸립니다. 그렇게 찾은 해법을 자기구조 설계 특허 11종으로 정리해 두었습니다. 새 작업도 검증된 구조 위에서 시작합니다.",
  },
  {
    icon: "globe",
    title: "혼자 풀지 않는 설계",
    description:
      "종이를 움직이는 방법은 한 사람 머리로 다 알기 어렵습니다. 세계 곳곳의 페이퍼 엔지니어들과 주고받으며 설계를 다듬고, 입체를 전개도로 펴 주는 페파쿠라(PePaKuRa Designer) 설계 교육도 맡고 있습니다.",
  },
  {
    icon: "education",
    title: "현장에서 다듬은 교육",
    description:
      "박물관과 학교 현장에서 오래 교구를 만들어 왔습니다. 도형의 내각이나 무게중심 같은 원리를, 아이가 종이를 접고 세우는 동안 손으로 먼저 만나도록 설계합니다.",
  },
  {
    icon: "leaf",
    title: "가볍게 왔다 가는 종이",
    description:
      "종이는 다 쓰면 종이로 버리면 됩니다. 친환경을 앞세우기보다, 만들고 버리는 일에 덜 미안한 재료를 택했습니다. 업사이클링 소재도 작업에 맞게 함께 씁니다.",
  },
];

const services = [
  {
    num: "01",
    title: "페이퍼 엔지니어링",
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
    title: "교육 프로그램",
    items: [
      "방과 후 교육 프로그램 및 재료 판매",
      "업사이클링 교육 키트",
      "코딩 전자 교육 키트",
    ],
    accent: "#F5C518",
  },
  {
    num: "03",
    title: "편집 디자인",
    items: [
      "캐릭터 제작",
      "기관·관공서·기업 BI/CI 제작",
      "브로셔·PPT 등 편집 디자인",
    ],
    accent: "#E91E8C",
  },
];

const timeline = [
  { year: "2013", event: "Paper Engineering Studio 창업 — 지기구조 전문 설계 페이퍼 엔지니어링 스튜디오 출범" },
  { year: "2015", event: "자기 구조 설계 특허 최초 등록, STEAM 교육 키트 출시" },
  { year: "2017", event: "페이퍼 토이 커뮤니티 '종이천하' 운영 시작" },
  { year: "2019", event: "누적 특허 11종 달성, 학교·기관 교육 프로그램 확대" },
  { year: "2021", event: "현대백화점·경주박물관 등 주요 기관 납품 본격화" },
  { year: "2023", event: "누적 납품 650건 돌파, 기업 굿즈 서비스 확장" },
  { year: "2024", event: "온라인 제작 문의 서비스 시작" },
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
              회사소개
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight" style={{ wordBreak: "keep-all" }}>
              {BRAND_TAGLINE_KR}<br />
              <span className="pe-gradient-text">PE Studio</span>입니다
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed" style={{ wordBreak: "keep-all" }}>
              디자인 사고를 바탕으로 페이퍼 엔지니어링, 교육 프로그램,
              편집 디자인을 제공합니다.
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
                소개
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">우리의 이야기</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                <p>
                  <strong className="text-slate-900">{SITE_NAME}(PE Studio)</strong>는
                  2013년부터 종이의 구조와 움직임을 설계해 온 지기구조 전문 설계 스튜디오입니다. 평면 한 장이 스스로 일어서고 움직이게 만드는 일을, 13년째 하고 있습니다.
                </p>
                <p>
                  보기 좋은 모형을 만드는 데서 그치지 않습니다. 받는 사람이 직접 접고 세우는 동안 오래 곁에 두게 되는 물건을 설계합니다. 그래서 우리는 늘 만들기 전에 먼저 설계하고, 말보다 샘플을 먼저 만들어 보냅니다.
                </p>
                <p>
                  그동안 자기구조 설계 <strong className="text-slate-900">특허 11종</strong>을 쌓았고,
                  문화체육관광부 장관상을 두 번 받았습니다. 현대백화점과 여러 박물관·학교, 지자체가 우리와 함께 일했습니다.
                </p>
                <p>
                  검증해 둔 구조 위에서 시작하니, 대개 약 4주 안에 정직한 품질로 납품합니다.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-7 border border-blue-100 pe-paper-shadow">
              <h3 className="font-bold text-slate-900 mb-5 tracking-tight">핵심 역량</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                {[
                  "자기구조 설계 특허 11종 보유",
                  "문화체육관광부 장관상 2회 수상",
                  "페파쿠라(PePaKuRa) 설계 교육 프로그램 운영",
                  "페이퍼 토이 커뮤니티 '종이천하' 운영",
                  "박물관·학교 현장 교구 제작",
                  "친환경·업사이클링 소재 적용",
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
              차별점
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">우리의 강점</h2>
            <p className="text-slate-500" style={{ wordBreak: "keep-all" }}>
              지기구조 전문 설계 스튜디오가 13년 동안 손에 익힌 것들입니다.
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
자기 구조 설계 특허 11종 보유 (특허청 등록)
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
              제공 분야
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">우리가 하는 일</h2>
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
              걸어온 길
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
            함께 만들 것이 있으신가요
          </h2>
          <p className="text-blue-200 mb-8" style={{ wordBreak: "keep-all" }}>
            생각하고 계신 작업이 있다면 언제든 견적을 요청해 주세요.
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
