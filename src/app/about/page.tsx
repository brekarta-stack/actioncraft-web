import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회사소개 | Craft Engineering Studio",
  description:
    "자기 구조 설계 특허 11종 보유, KAIST 협력, 국내 최대 페이퍼 토이 커뮤니티 운영. Craft Engineering Studio(CES)는 사용자 경험을 기획하고 디자인하는 크리에이티브 디자인 스튜디오입니다.",
};

const stats = [
  { num: "11종", label: "자기구조 설계 특허" },
  { num: "1,000+", label: "누적 제작 건수" },
  { num: "국내 최대", label: "페이퍼 토이 커뮤니티" },
  { num: "KAIST", label: "출신 개발 인력" },
];

const strengths = [
  {
    icon: "🏅",
    title: "자기 구조 설계 특허 11종",
    description:
      "수많은 종이 모형 설계 경험과 다수의 지식 재산권을 바탕으로, 국내 최고 수준의 구동형 페이퍼 모델 기술을 보유하고 있습니다.",
  },
  {
    icon: "🌐",
    title: "세계 아티스트 네트워크",
    description:
      "세계 각지의 다양한 아티스트들과 교류를 통해 지속적으로 설계 메커니즘을 고도화합니다. PePaKuRa Designer 공식 교육 운영.",
  },
  {
    icon: "🎓",
    title: "KAIST 협력 개발",
    description:
      "KAIST 출신 개발자 및 교육 프로그램 개발진이 함께합니다. 과학적 원리를 기반으로 한 교육적 페이퍼 모델을 설계합니다.",
  },
  {
    icon: "🌱",
    title: "친환경 업사이클링",
    description:
      "친환경 재질로 만드는 캐릭터. 단순하게 표현하거나, 의미를 더해 훨씬 가치 있게 표현하는 것도 가능합니다.",
  },
];

const clients = [
  { name: "현대백화점", work: "스마일리 페이퍼 토이" },
  { name: "KAIST", work: "납육이 캐릭터" },
  { name: "경주박물관", work: "도토리 캐릭터" },
  { name: "수원시", work: "수원이 캐릭터" },
  { name: "공주시", work: "고마곰·공주 캐릭터" },
  { name: "뚱이천하", work: "국내 최대 커뮤니티 운영" },
];

const services = [
  {
    num: "01",
    title: "Paper Model Engineering",
    items: [
      "교육용, 홍보용 캐릭터 종이 모형 외주 제작",
      "구동 가능 플랫폼 제공 및 캐릭터 디자인",
      "기관, 관공서, 기업 등 맞춤 제작",
      "친환경, 업사이클링 활용 교구",
    ],
  },
  {
    num: "02",
    title: "Education Program",
    items: [
      "방과 후 교육 프로그램 및 재료 판매",
      "업사이클링 교육 키트",
      "코딩 전자 교육 키트",
    ],
  },
  {
    num: "03",
    title: "Editorial Design",
    items: [
      "캐릭터 제작",
      "기관, 관공서, 기업 BI/CI 제작",
      "브로셔, PPT 등 편집 디자인",
    ],
  },
];

const timeline = [
  { year: "2018", event: "Craft Engineering Studio(CES) 창업, 페이퍼 모델 엔지니어링 스튜디오 출범" },
  { year: "2019", event: "자기 구조 설계 특허 최초 등록, STEAM 교육 키트 출시" },
  { year: "2020", event: "국내 최대 페이퍼 토이 커뮤니티 '뚱이천하' 운영 시작" },
  { year: "2021", event: "누적 특허 11종 달성, KAIST 협력 교육 프로그램 개발" },
  { year: "2022", event: "현대백화점, 경주박물관 등 주요 기관 납품" },
  { year: "2023", event: "누적 제작 1,000건 달성, 기업 굿즈 서비스 확장" },
  { year: "2024", event: "온라인 자동 견적 서비스 론칭" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28" style={{ background: "#1E22B2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full mb-6">
              Share The Creativity
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              사용자 경험을 기획하고<br />
              <span className="text-orange-400">디자인하는 스튜디오</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              디자인 프로세스와 디자인 씽킹을 바탕으로 Paper Model Engineering,
              Education Program, Editorial Design 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {stats.map((stat) => (
              <div key={stat.label} className="py-8 px-6 text-center">
                <div className="text-2xl font-bold text-orange-500 mb-1">{stat.num}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
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
              <h2 className="text-3xl font-bold text-slate-900 mb-6">우리의 이야기</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Craft Engineering Studio(CES)는 창의적 발상을 기반으로 디자이너 크루들이 모인
                  크리에이티브 디자인 스튜디오입니다.
                </p>
                <p>
                  단순한 심미적 디자인을 넘어, 고객의 실제 니즈를 파악하여
                  최적화된 결과물을 제안하는 것이 저희의 방식입니다.
                </p>
                <p>
                  수많은 종이 모형 설계 경험과 11종의 특허, 국내 유일의 종이 모델
                  디자이너 교육 시스템, KAIST 출신 개발 인력을 통해
                  국내 최고의 페이퍼 토이 제작 업체로 자리잡았습니다.
                </p>
                <p>
                  타업체와 비교해도 뛰어난 서비스와 합리적인 가격, 신속한 납품이 가능합니다.
                </p>
              </div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="font-bold text-slate-900 mb-4">핵심 역량</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {[
                  "자기 구조 설계 관련 11종의 특허 보유",
                  "국내 최대 페이퍼 토이 커뮤니티 '뚱이천하' 운영",
                  "국내 유일 PePaKuRa 설계 교육 프로그램 제공",
                  "KAIST 출신 개발자 및 교육 프로그램 개발",
                  "우수한 개발 인적 자원 보유",
                  "친환경 재질 및 업사이클링 소재 적용",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">차별화 포인트</h2>
            <p className="text-slate-500">국내 최고의 페이퍼 토이 개발 업체로서의 강점</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {strengths.map((s) => (
              <div key={s.title} className="flex gap-5 p-6 bg-slate-50 rounded-2xl hover:bg-orange-50 transition-colors">
                <div className="text-4xl flex-shrink-0">{s.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">제공 서비스</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.num} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="text-orange-500 font-bold text-sm mb-2">{svc.num}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{svc.title}</h3>
                <ul className="space-y-2">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-orange-400 flex-shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">함께한 파트너</h2>
            <p className="text-slate-500 text-sm">국내 주요 기관 및 기업과 함께 제작했습니다.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {clients.map((c) => (
              <div key={c.name} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-colors">
                <div className="font-bold text-slate-900 text-sm mb-1">{c.name}</div>
                <div className="text-slate-500 text-xs">{c.work}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">연혁</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-orange-200" />
            <div className="space-y-8">
              {timeline.map((item) => (
                <div key={item.year} className="flex gap-8 items-start">
                  <div className="w-12 text-right flex-shrink-0">
                    <span className="text-sm font-bold text-orange-500">{item.year}</span>
                  </div>
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow" />
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-700 text-sm">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">프로젝트를 함께 시작해볼까요?</h2>
          <p className="text-orange-100 mb-6">아이디어가 있다면 언제든지 무료 견적을 요청해주세요.</p>
          <Link
            href="/quote"
            className="inline-block px-8 py-3.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
          >
            무료 견적 받기
          </Link>
        </div>
      </section>
    </>
  );
}

