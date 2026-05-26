import Link from "next/link";

const trustStats = [
  { num: "11종", label: "자기구조 설계 특허" },
  { num: "1,000+", label: "누적 제작 프로젝트" },
  { num: "3~4주", label: "평균 납기" },
  { num: "국내 최대", label: "페이퍼 토이 커뮤니티 운영" },
];

const features = [
  {
    icon: "🏅",
    title: "검증된 특허 기술",
    description:
      "자기 구조 설계 관련 11종의 특허를 보유한 국내 최고 수준의 기술력. 체계적이고 정밀한 설계로 다양한 움직임을 구현합니다.",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    icon: "🌐",
    title: "글로벌 메커니즘",
    description:
      "세계 각지의 아티스트들과 지속적으로 교류하며 설계 메커니즘을 고도화합니다. PePaKuRa 설계 프로그램 공식 교육 운영.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: "🔬",
    title: "STEAM 교육 효과",
    description:
      "수학·도형·과학 등 기초 원리를 움직이는 캐릭터로 자연스럽게 학습. KAIST 출신 개발자와 함께 만든 교육 콘텐츠.",
    gradient: "from-pink-400 to-fuchsia-500",
  },
];

const services = [
  {
    name: "Action Paper Toy",
    nameKo: "페이퍼 모델 엔지니어링",
    desc: "캐릭터 구동 가능 플랫폼 제공 및 기관·기업 맞춤 제작",
    emoji: "🎪",
    tags: ["움직이는 구조", "특허 기술", "친환경"],
    accent: "#06C6C8",
  },
  {
    name: "Education Kit",
    nameKo: "교육 키트",
    desc: "방과 후 교육 프로그램, 업사이클링·코딩 전자 교육 키트",
    emoji: "📐",
    tags: ["STEAM 교육", "업사이클링", "키트 판매"],
    accent: "#F5C518",
  },
  {
    name: "Custom Character",
    nameKo: "캐릭터 & 굿즈",
    desc: "기관·관공서·기업 캐릭터 외주, 기념품·축제·체험 굿즈 제작",
    emoji: "🎭",
    tags: ["캐릭터 개발", "대량 생산", "맞춤 제작"],
    accent: "#E91E8C",
  },
  {
    name: "Editorial Design",
    nameKo: "편집 디자인",
    desc: "BI/CI 개발, 브로셔·PPT 등 브랜드 아이덴티티 디자인",
    emoji: "✏️",
    tags: ["BI/CI", "브로셔", "브랜딩"],
    accent: "#8B5CF6",
  },
];

const clients = [
  { name: "현대백화점", desc: "스마일리 페이퍼토이" },
  { name: "KAIST", desc: "캐릭터 납육이" },
  { name: "경주박물관", desc: "캐릭터 도토리" },
  { name: "수원시", desc: "캐릭터 수원이" },
  { name: "공주시", desc: "고마곰과 공주" },
  { name: "국립기관", desc: "다수 관공서 납품" },
];

const processSteps = [
  { step: "01", label: "상담 및 기획", detail: "생산 제품 종류 및 수량 결정", period: "1주" },
  { step: "02", label: "구조 설계 & 샘플링", detail: "컨셉 맞는 최적 움직임 설계", period: "1주" },
  { step: "03", label: "디자인 작업", detail: "고객사 피드백 반영 및 완성", period: "1.5주" },
  { step: "04", label: "생산 및 납품", detail: "공정 기반 생산, 패키징 후 납품", period: "~" },
];

const blogPosts = [
  {
    title: "움직이는 페이퍼토이, 도형의 내각과 무게중심 원리",
    date: "2024.03.15",
    excerpt: "평면이 입체로 변하는 원리, 누워있던 물체가 스스로 일어나는 물리 법칙을 종이로 구현하는 방법을 알아봅니다.",
    tag: "제작 원리",
    emoji: "⚙️",
    tagColor: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "STEAM 교육에 오토마타를 활용하는 5가지 방법",
    date: "2024.03.08",
    excerpt: "수학, 도형, 과학 등 기초 원리를 친근한 캐릭터로 자연스럽게 배우는 교육 현장 사례를 공유합니다.",
    tag: "교육",
    emoji: "📐",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    title: "현대백화점·KAIST가 선택한 페이퍼토이 제작기",
    date: "2024.02.25",
    excerpt: "국내 주요 기관과 기업들이 브랜드 캐릭터를 페이퍼토이로 제작한 프로젝트 비하인드를 소개합니다.",
    tag: "프로젝트",
    emoji: "🏢",
    tagColor: "bg-pink-100 text-pink-700",
  },
];

function BoxNetSVG() {
  const W = 220; // 앞면·뒷면 너비
  const H = 150; // 면 높이
  const D = 100; // 깊이(측면 너비)

  // 전개도 레이아웃 (십자형 + 뒷면)
  // [윗면]
  // [좌측][앞면][우측][뒷면]
  // [밑면]
  const vw = D + W + D + W; // 640
  const vh = D + H + D;     // 350

  // 각 면의 좌상단 좌표
  const top    = { x: D,         y: 0,   w: W, h: D };
  const left   = { x: 0,         y: D,   w: D, h: H };
  const front  = { x: D,         y: D,   w: W, h: H };
  const right  = { x: D + W,     y: D,   w: D, h: H };
  const back   = { x: D + W + D, y: D,   w: W, h: H };
  const bottom = { x: D,         y: D+H, w: W, h: D };

  const faceFill  = "rgba(255,255,255,0.04)";
  const cutStroke = "rgba(255,255,255,0.55)";
  const foldStroke = "rgba(255,255,255,0.28)";
  const labelFill = "rgba(255,255,255,0.35)";

  // 십자 외곽선 path (절단선)
  const crossPath = `
    M ${D},0
    H ${D+W} V ${D} H ${D+W+D} V ${D+H} H ${D+W} V ${D+H+D}
    H ${D} V ${D+H} H 0 V ${D} H ${D} Z
  `;

  const faces = [top, left, front, right, back, bottom];

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      fill="none"
      aria-hidden
      className="w-full h-full"
    >
      {/* 각 면 배경 */}
      {faces.map((f, i) => (
        <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill={faceFill} />
      ))}

      {/* 절단선 (외곽) */}
      <path d={crossPath} stroke={cutStroke} strokeWidth="1.5" />
      <rect x={back.x} y={back.y} width={back.w} height={back.h}
        stroke={cutStroke} strokeWidth="1.5" fill={faceFill} />

      {/* 접힘선 (내부 공유 모서리, 점선) */}
      {/* 윗면-앞면 */}
      <line x1={D} y1={D} x2={D+W} y2={D} stroke={foldStroke} strokeWidth="1.2" strokeDasharray="10 7" />
      {/* 앞면-밑면 */}
      <line x1={D} y1={D+H} x2={D+W} y2={D+H} stroke={foldStroke} strokeWidth="1.2" strokeDasharray="10 7" />
      {/* 좌측면-앞면 */}
      <line x1={D} y1={D} x2={D} y2={D+H} stroke={foldStroke} strokeWidth="1.2" strokeDasharray="10 7" />
      {/* 앞면-우측면 */}
      <line x1={D+W} y1={D} x2={D+W} y2={D+H} stroke={foldStroke} strokeWidth="1.2" strokeDasharray="10 7" />
      {/* 우측면-뒷면 */}
      <line x1={D+W+D} y1={D} x2={D+W+D} y2={D+H} stroke={foldStroke} strokeWidth="1.2" strokeDasharray="10 7" />

      {/* 면 레이블 */}
      <text x={D+W/2}       y={D/2+7}     textAnchor="middle" fill={labelFill} fontSize="15" fontFamily="monospace" letterSpacing="1">윗면</text>
      <text x={D/2}         y={D+H/2+7}   textAnchor="middle" fill={labelFill} fontSize="13" fontFamily="monospace" letterSpacing="1">좌측면</text>
      <text x={D+W/2}       y={D+H/2+7}   textAnchor="middle" fill={labelFill} fontSize="15" fontFamily="monospace" letterSpacing="1">앞면</text>
      <text x={D+W+D/2}     y={D+H/2+7}   textAnchor="middle" fill={labelFill} fontSize="13" fontFamily="monospace" letterSpacing="1">우측면</text>
      <text x={D+W+D+W/2}   y={D+H/2+7}   textAnchor="middle" fill={labelFill} fontSize="15" fontFamily="monospace" letterSpacing="1">뒷면</text>
      <text x={D+W/2}       y={D+H+D/2+7} textAnchor="middle" fill={labelFill} fontSize="15" fontFamily="monospace" letterSpacing="1">밑면</text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative py-24 md:py-36 overflow-hidden" style={{ background: "#1E22B2" }}>
        {/* Box net decoration */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
          <div className="w-[70%] max-w-3xl opacity-50 -rotate-6 translate-x-16">
            <BoxNetSVG />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="ces-gradient-border inline-block px-4 py-1.5 text-sm font-semibold rounded-full mb-6 bg-white/10 text-white">
              Share The Creativity · 창의를 함께 나누다
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              종이가 움직이면<br />
              <span className="ces-gradient-text">브랜드가 살아납니다</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-4 leading-relaxed">
              자기 구조 설계 특허 11종을 보유한 국내 최고의 페이퍼 모델 엔지니어링 스튜디오.
            </p>
            <p className="text-blue-300 mb-10">
              현대백화점, KAIST, 경주박물관 등 1,000개 이상의 프로젝트를 완성했습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="px-8 py-4 text-white font-bold rounded-xl transition-opacity hover:opacity-90 text-lg text-center"
                style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
              >
                무료 견적 받기 →
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors text-lg text-center"
              >
                제품 살펴보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {trustStats.map((stat, i) => {
              const colors = ["#06C6C8", "#F5C518", "#E91E8C", "#1E22B2"];
              return (
                <div key={stat.label} className="py-6 px-6 text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: colors[i % colors.length] }}>
                    {stat.num}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-16 md:py-24" style={{ background: "#F0F2FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E22B2" }}>
              왜 CES인가요?
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              단순 제작이 아닌, 검증된 기술과 글로벌 네트워크로 만드는 차이입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow ces-gradient-border"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#1E22B2" }}>{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E22B2" }}>서비스</h2>
            <p className="text-slate-500">기획부터 납품까지, 종이로 만들 수 있는 모든 것.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((s) => (
              <Link
                key={s.name}
                href="/products"
                className="group flex gap-5 p-6 rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-lg transition-all bg-white"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ background: s.accent + "22", color: s.accent }}
                >
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 font-medium mb-0.5">{s.name}</div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: "#1E22B2" }}>{s.nameKo}</h3>
                  <p className="text-sm text-slate-600 mb-3">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center font-semibold gap-1" style={{ color: "#1E22B2" }}>
              서비스 전체 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Clients ─── */}
      <section className="py-16 md:py-20 relative overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none flex items-center justify-center">
          <div className="w-full max-w-2xl rotate-3">
            <BoxNetSVG />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-2">TRUSTED BY</p>
            <h2 className="text-2xl font-bold text-white">이미 검증된 파트너십</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {clients.map((c) => (
              <div
                key={c.name}
                className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center transition-colors border border-white/10"
              >
                <div className="text-white font-bold text-sm mb-1">{c.name}</div>
                <div className="text-blue-300 text-xs">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Process ─── */}
      <section className="py-16 md:py-24" style={{ background: "#F0F2FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#1E22B2" }}>주문 제작 프로세스</h2>
            <p className="text-slate-500">대부분의 제품은 <strong style={{ color: "#1E22B2" }}>3~4주 내 납품</strong>이 가능합니다.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {processSteps.map((s, i) => {
              const stepColors = ["#06C6C8", "#F5C518", "#E91E8C", "#1E22B2"];
              return (
                <div key={s.step} className="relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-full h-0.5 z-0"
                      style={{ background: "linear-gradient(90deg, #06C6C8, #E91E8C)" }} />
                  )}
                  <div className="relative z-10 text-center">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 text-white font-bold text-lg rounded-full mb-3 shadow-md"
                      style={{ background: stepColors[i] }}
                    >
                      {s.step}
                    </div>
                    {s.period !== "~" && (
                      <div className="text-xs font-semibold mb-1" style={{ color: stepColors[i] }}>{s.period}</div>
                    )}
                    <div className="font-bold text-slate-900 mb-1">{s.label}</div>
                    <div className="text-xs text-slate-500">{s.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 p-5 bg-white rounded-2xl border border-blue-100 max-w-2xl mx-auto">
            <p className="text-sm text-slate-600 text-center">
              💡 <strong style={{ color: "#1E22B2" }}>최소 수량 1,000부부터</strong> 제작 가능하며, 수량 증가 시 단가가 내려갑니다.
              포장(OPP/벌크), 형태(움직임/고정), 조립방식(점착/끼우기)을 선택할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Blog Preview ─── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E22B2" }}>최신 블로그</h2>
            <p className="text-slate-500">제작 원리와 프로젝트 이야기를 공유합니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.title}
                href="/blog"
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-44 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform"
                  style={{ background: "#F0F2FF" }}
                >
                  {post.emoji}
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#1E22B2] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{post.excerpt}</p>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/blog" className="inline-flex items-center font-semibold gap-1" style={{ color: "#1E22B2" }}>
              블로그 전체 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 pointer-events-none select-none opacity-30 flex items-center justify-center">
          <div className="w-full max-w-2xl"><BoxNetSVG /></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            브랜드를 움직이게 할<br />
            <span className="ces-gradient-text">준비됐나요?</span>
          </h2>
          <p className="text-blue-200 text-lg mb-2">
            제품 정보를 입력하면 담당자가 영업일 1~2일 내 맞춤 견적을 보내드립니다.
          </p>
          <p className="text-blue-300 text-sm mb-10">최소 수량 1,000부 · 평균 납기 3~4주</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/quote"
              className="px-10 py-4 font-bold rounded-xl transition-opacity hover:opacity-90 text-lg text-white"
              style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
            >
              무료 견적 받기
            </Link>
            <Link
              href="/about"
              className="px-10 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-colors text-lg"
            >
              회사 소개 보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
