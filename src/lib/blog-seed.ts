/**
 * 블로그 시드 글 — DB(supabase) 가 비어 있을 때도 SEO 색인을 시작하기 위한
 * 코드 내장 콘텐츠. 각 글은 src/lib/blog.ts 의 getPosts() / getPostBySlug() 에서
 * Supabase 결과와 머지되며, 동일 slug 가 DB 에 들어오면 DB 가 우선.
 *
 * 각 글은 인라인 <figure><svg/></figure> 일러스트를 본문에 직접 포함.
 * (blog/[slug]/page.tsx 의 ReactMarkdown 이 rehype-raw 로 raw HTML 을 허용)
 *
 * 작성 시기: 2026-05 (초기 SEO 시드)
 */

import type { Post } from "./blog";

const NOW = "2026-05-27T00:00:00.000Z";

/**
 * 인라인 SVG figure를 한 줄로 정규화한다.
 * 마크다운(remark + rehype-raw) 렌더 시 raw HTML 블록은 "빈 줄"에서 종료되고,
 * 4칸 이상 들여쓴 줄은 "들여쓰기 코드 블록"으로 인식되어 SVG 소스가 그대로 노출된다.
 * 줄바꿈 + 뒤따르는 공백을 단일 공백으로 합쳐 두 문제를 모두 제거한다.
 * (SVG/HTML은 태그 사이 공백을 무시하므로 시각적 영향 없음)
 */
const oneLine = (s: string): string => s.replace(/\n\s*/g, " ").trim();

/* ──────────────────────────────────────────────
 * 재사용 가능한 인라인 일러스트 (markdown 본문 안에 들어감)
 * ────────────────────────────────────────────── */

// 페스티벌/축제 일러스트 (천막 + 캐릭터 페이퍼토이)
const FigFestival = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
<svg viewBox="0 0 720 320" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="tent1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#06C6C8"/><stop offset="100%" stop-color="#1E22B2"/></linearGradient></defs>
  <!-- 지면 -->
  <rect x="0" y="270" width="720" height="50" fill="#E0F7F8"/>
  <!-- 가운데 축제 천막 -->
  <path d="M270 270 L360 130 L450 270 Z" fill="url(#tent1)"/>
  <path d="M285 270 L360 165 L435 270" stroke="white" stroke-width="2" fill="none" opacity="0.4"/>
  <rect x="345" y="200" width="30" height="70" fill="#1E22B2"/>
  <!-- 깃발 -->
  <line x1="360" y1="100" x2="360" y2="130" stroke="#1E22B2" stroke-width="2"/>
  <path d="M360 105 L390 115 L360 125 Z" fill="#F5C518"/>
  <!-- 좌측 페이퍼토이 캐릭터 -->
  <g transform="translate(140,170)">
    <path d="M-30 -10 L30 -10 L35 60 L-35 60 Z" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
    <path d="M-30 -10 L-15 -35 L15 -35 L30 -10 Z" fill="#F5C518" stroke="#1E22B2" stroke-width="1.5"/>
    <circle cx="-10" cy="10" r="3" fill="#1E22B2"/><circle cx="10" cy="10" r="3" fill="#1E22B2"/>
    <path d="M-10 30 Q0 38 10 30" stroke="#1E22B2" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="-25" y="60" width="15" height="35" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
    <rect x="10" y="60" width="15" height="35" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
  </g>
  <!-- 우측 페이퍼토이 캐릭터 (다른 색상) -->
  <g transform="translate(580,170)">
    <path d="M-30 -10 L30 -10 L35 60 L-35 60 Z" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
    <path d="M-30 -10 L-15 -35 L15 -35 L30 -10 Z" fill="#E91E8C" stroke="#1E22B2" stroke-width="1.5"/>
    <circle cx="-10" cy="10" r="3" fill="#1E22B2"/><circle cx="10" cy="10" r="3" fill="#1E22B2"/>
    <path d="M-10 30 Q0 38 10 30" stroke="#1E22B2" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="-25" y="60" width="15" height="35" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
    <rect x="10" y="60" width="15" height="35" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
  </g>
  <!-- 떠다니는 종이 조각들 -->
  <g opacity="0.6"><rect x="80" y="60" width="20" height="20" fill="#F5C518" transform="rotate(15 90 70)"/></g>
  <g opacity="0.6"><rect x="640" y="80" width="16" height="16" fill="#06C6C8" transform="rotate(-20 648 88)"/></g>
  <g opacity="0.6"><rect x="490" y="50" width="14" height="14" fill="#E91E8C" transform="rotate(30 497 57)"/></g>
</svg>
<figcaption class="text-xs text-slate-500 text-center py-2 bg-white/50">▲ 지역 캐릭터를 페이퍼토이로 만들면 축제 현장의 시각적 임팩트가 즉시 올라갑니다.</figcaption>
</figure>`);

// 비용 비교 차트
const FigCostCompare = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-white border border-slate-200">
<svg viewBox="0 0 720 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="35" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="16" font-weight="700" fill="#1E22B2">1,000개 제작 시 단가 비교 (예시)</text>
  <!-- Y축 라벨 -->
  <text x="80" y="80" font-family="Pretendard" font-size="13" fill="#475569">텀블러</text>
  <text x="80" y="130" font-family="Pretendard" font-size="13" fill="#475569">에코백</text>
  <text x="80" y="180" font-family="Pretendard" font-size="13" fill="#475569">아크릴 키링</text>
  <text x="80" y="230" font-family="Pretendard" font-size="13" font-weight="700" fill="#1E22B2">페이퍼토이</text>
  <!-- 막대 -->
  <rect x="170" y="65" width="380" height="22" rx="4" fill="#E2E8F0"/>
  <text x="560" y="81" font-family="Pretendard" font-size="13" fill="#475569">약 8,000원/개</text>
  <rect x="170" y="115" width="220" height="22" rx="4" fill="#E2E8F0"/>
  <text x="400" y="131" font-family="Pretendard" font-size="13" fill="#475569">약 4,500원/개</text>
  <rect x="170" y="165" width="180" height="22" rx="4" fill="#E2E8F0"/>
  <text x="360" y="181" font-family="Pretendard" font-size="13" fill="#475569">약 3,500원/개</text>
  <rect x="170" y="215" width="120" height="22" rx="4" fill="url(#barg)"/>
  <defs><linearGradient id="barg" x1="0%" x2="100%"><stop offset="0%" stop-color="#06C6C8"/><stop offset="100%" stop-color="#E91E8C"/></linearGradient></defs>
  <text x="300" y="231" font-family="Pretendard" font-size="13" font-weight="700" fill="#1E22B2">약 2,000~3,000원/개</text>
</svg>
<figcaption class="text-xs text-slate-500 text-center py-2 bg-slate-50">▲ 수량·옵션에 따라 다르나, 동일 예산으로 더 많은 수량 제작이 가능합니다.</figcaption>
</figure>`);

// 교실 + 학생 + 페이퍼토이 일러스트
const FigClassroom = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
<svg viewBox="0 0 720 320" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <!-- 바닥 -->
  <rect x="0" y="260" width="720" height="60" fill="#FFF3D0"/>
  <!-- 칠판 -->
  <rect x="60" y="40" width="280" height="160" rx="6" fill="#1E22B2"/>
  <rect x="65" y="45" width="270" height="150" rx="4" fill="#171AB0"/>
  <text x="200" y="100" text-anchor="middle" font-family="Pretendard" font-size="20" font-weight="700" fill="white">STEAM</text>
  <text x="200" y="135" text-anchor="middle" font-family="Pretendard" font-size="14" fill="#F5C518">페이퍼 엔지니어링 교실</text>
  <!-- 도형 전개도 (작게) -->
  <g transform="translate(160 150) scale(0.5)" opacity="0.6">
    <rect x="20" y="0" width="30" height="30" stroke="white" stroke-width="1.5" fill="none"/>
    <rect x="0" y="30" width="80" height="30" stroke="white" stroke-width="1.5" fill="none"/>
    <rect x="20" y="60" width="30" height="30" stroke="white" stroke-width="1.5" fill="none"/>
  </g>
  <!-- 책상 -->
  <rect x="400" y="180" width="240" height="20" rx="3" fill="#8B5A3C"/>
  <rect x="420" y="200" width="10" height="60" fill="#8B5A3C"/>
  <rect x="610" y="200" width="10" height="60" fill="#8B5A3C"/>
  <!-- 책상 위 페이퍼토이 (움직이는 캐릭터) -->
  <g transform="translate(520,150)">
    <path d="M-25 -5 L25 -5 L28 35 L-28 35 Z" fill="white" stroke="#1E22B2" stroke-width="1.5"/>
    <path d="M-25 -5 L-12 -25 L12 -25 L25 -5 Z" fill="#06C6C8" stroke="#1E22B2" stroke-width="1.5"/>
    <circle cx="-7" cy="10" r="2.5" fill="#1E22B2"/><circle cx="7" cy="10" r="2.5" fill="#1E22B2"/>
    <path d="M-7 22 Q0 28 7 22" stroke="#1E22B2" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </g>
  <!-- 학생 (실루엣) -->
  <g transform="translate(480,260)">
    <circle cx="0" cy="-50" r="14" fill="#1E22B2"/>
    <path d="M-15 -35 L15 -35 L20 0 L-20 0 Z" fill="#1E22B2"/>
  </g>
  <g transform="translate(560,260)">
    <circle cx="0" cy="-50" r="14" fill="#E91E8C"/>
    <path d="M-15 -35 L15 -35 L20 0 L-20 0 Z" fill="#E91E8C"/>
  </g>
  <!-- 떠다니는 종이 -->
  <g opacity="0.5"><rect x="380" y="70" width="18" height="18" fill="#F5C518" transform="rotate(20 389 79)"/></g>
  <g opacity="0.5"><rect x="660" y="100" width="14" height="14" fill="#06C6C8" transform="rotate(-15 667 107)"/></g>
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ 학교만의 오리지널 페이퍼 엔지니어링 교구는 정체성과 입소문 효과를 동시에 만듭니다.</figcaption>
</figure>`);

// SNS 확산 다이어그램
const FigSnsShare = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
<svg viewBox="0 0 720 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <!-- 가운데 페이퍼토이 -->
  <g transform="translate(360,140)">
    <path d="M-30 -10 L30 -10 L35 50 L-35 50 Z" fill="white" stroke="#1E22B2" stroke-width="2"/>
    <path d="M-30 -10 L-15 -35 L15 -35 L30 -10 Z" fill="#F5C518" stroke="#1E22B2" stroke-width="2"/>
    <circle cx="-10" cy="10" r="3.5" fill="#1E22B2"/><circle cx="10" cy="10" r="3.5" fill="#1E22B2"/>
    <path d="M-10 30 Q0 38 10 30" stroke="#1E22B2" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <!-- 화살표 + 폰 4개 (사방으로 퍼지는 효과) -->
  ${[
    { x: 130, y: 70, label: "Instagram" },
    { x: 590, y: 70, label: "TikTok" },
    { x: 130, y: 210, label: "유튜브 쇼츠" },
    { x: 590, y: 210, label: "블로그" },
  ]
    .map(
      (p) =>
        `<g>
          <line x1="360" y1="140" x2="${p.x}" y2="${p.y}" stroke="#E91E8C" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>
          <rect x="${p.x - 25}" y="${p.y - 35}" width="50" height="70" rx="8" fill="white" stroke="#E91E8C" stroke-width="2"/>
          <rect x="${p.x - 20}" y="${p.y - 30}" width="40" height="55" rx="3" fill="#FFE8F0"/>
          <text x="${p.x}" y="${p.y + 55}" text-anchor="middle" font-family="Pretendard" font-size="11" font-weight="600" fill="#E91E8C">${p.label}</text>
        </g>`
    )
    .join("")}
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ 움직이는 종이는 정적 이미지보다 SNS 공유율이 압도적으로 높습니다.</figcaption>
</figure>`);

// 손과 종이 접기 (AI 시대 인지 효과)
const FigHandsPaper = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100">
<svg viewBox="0 0 720 320" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <!-- 좌: AI/컴퓨터 (납작한 회로) -->
  <g transform="translate(170,160)">
    <rect x="-60" y="-50" width="120" height="80" rx="6" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <rect x="-50" y="-40" width="100" height="60" rx="3" fill="#475569"/>
    <text x="0" y="-5" text-anchor="middle" font-family="Pretendard" font-size="14" font-weight="700" fill="#06C6C8">AI</text>
    <text x="0" y="13" text-anchor="middle" font-family="Pretendard" font-size="10" fill="#94A3B8">자동 생성</text>
    <rect x="-30" y="30" width="60" height="6" fill="#94A3B8"/>
    <rect x="-15" y="36" width="30" height="14" fill="#94A3B8"/>
    <text x="0" y="80" text-anchor="middle" font-family="Pretendard" font-size="12" fill="#64748B">출력만 받는다</text>
  </g>
  <!-- VS -->
  <text x="360" y="170" text-anchor="middle" font-family="Pretendard" font-size="24" font-weight="800" fill="#1E22B2">VS</text>
  <!-- 우: 손이 종이 접는 모습 -->
  <g transform="translate(550,160)">
    <!-- 종이 (입체) -->
    <path d="M-40 -30 L40 -30 L45 30 L-45 30 Z" fill="white" stroke="#1E22B2" stroke-width="2"/>
    <path d="M-40 -30 L-20 -50 L20 -50 L40 -30 Z" fill="#F5C518" stroke="#1E22B2" stroke-width="2"/>
    <line x1="-40" y1="-30" x2="40" y2="-30" stroke="#1E22B2" stroke-width="1.5" stroke-dasharray="4 4"/>
    <!-- 손 (단순화) -->
    <g transform="translate(-30 35)">
      <path d="M0 0 Q-5 -10 0 -20 L20 -25 L30 -15 L25 5 Z" fill="#FFE5C2" stroke="#A08055" stroke-width="1.5"/>
    </g>
    <g transform="translate(30 35)">
      <path d="M0 0 Q5 -10 0 -20 L-20 -25 L-30 -15 L-25 5 Z" fill="#FFE5C2" stroke="#A08055" stroke-width="1.5"/>
    </g>
    <text x="0" y="80" text-anchor="middle" font-family="Pretendard" font-size="12" font-weight="700" fill="#1E22B2">직접 손으로 만든다</text>
  </g>
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ AI가 결과물을 만들수록, 인간의 인지·운동 발달은 직접 손을 쓸 때 일어납니다.</figcaption>
</figure>`);

// 기하학 변환 (평면 → 입체)
const FigGeometry = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100">
<svg viewBox="0 0 720 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <!-- 좌: 평면 전개도 -->
  <g transform="translate(160,140)">
    <rect x="-30" y="-60" width="60" height="40" stroke="#1E22B2" stroke-width="2" fill="white"/>
    <rect x="-70" y="-20" width="40" height="60" stroke="#1E22B2" stroke-width="2" fill="white"/>
    <rect x="-30" y="-20" width="60" height="60" stroke="#1E22B2" stroke-width="2" fill="#F0F2FF"/>
    <rect x="30" y="-20" width="40" height="60" stroke="#1E22B2" stroke-width="2" fill="white"/>
    <rect x="-30" y="40" width="60" height="40" stroke="#1E22B2" stroke-width="2" fill="white"/>
    <text x="0" y="120" text-anchor="middle" font-family="Pretendard" font-size="13" font-weight="600" fill="#1E22B2">평면 전개도</text>
  </g>
  <!-- 화살표 -->
  <g transform="translate(360,140)">
    <line x1="-50" y1="0" x2="50" y2="0" stroke="#E91E8C" stroke-width="3" marker-end="url(#arrow)"/>
    <text x="0" y="-15" text-anchor="middle" font-family="Pretendard" font-size="14" font-weight="700" fill="#E91E8C">접기</text>
    <text x="0" y="25" text-anchor="middle" font-family="Pretendard" font-size="11" fill="#64748B">기하학 사고</text>
  </g>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#E91E8C"/></marker>
  </defs>
  <!-- 우: 입체 정육면체 -->
  <g transform="translate(560,140)">
    <path d="M-40 -20 L0 -50 L40 -20 L40 30 L0 60 L-40 30 Z" fill="white" stroke="#1E22B2" stroke-width="2"/>
    <path d="M-40 -20 L0 -50 L40 -20 L0 10 Z" fill="#06C6C8" opacity="0.4" stroke="#1E22B2" stroke-width="2"/>
    <path d="M0 10 L40 -20 L40 30 L0 60 Z" fill="#1E22B2" opacity="0.15"/>
    <path d="M-40 -20 L0 10 L0 60 L-40 30 Z" fill="#F5C518" opacity="0.3"/>
    <text x="0" y="105" text-anchor="middle" font-family="Pretendard" font-size="13" font-weight="600" fill="#1E22B2">입체 구조</text>
  </g>
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ 평면이 입체가 되는 과정 자체가 강력한 기하학·공간 인지 학습입니다.</figcaption>
</figure>`);

// 체크리스트 일러스트
const FigChecklist = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
<svg viewBox="0 0 720 320" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <!-- 종이 (체크리스트) -->
  <g transform="translate(360,160)">
    <rect x="-160" y="-120" width="320" height="240" rx="8" fill="white" stroke="#1E22B2" stroke-width="2"/>
    <path d="M140 -120 L160 -100 L160 -120 Z" fill="#F0F2FF"/>
    <text x="-130" y="-90" font-family="Pretendard" font-size="14" font-weight="700" fill="#1E22B2">외주 체크리스트</text>
    <line x1="-130" y1="-75" x2="130" y2="-75" stroke="#E2E8F0" stroke-width="1"/>
    <!-- 5개 체크 항목 -->
    ${[
      "최소 수량 및 단가 구조",
      "샘플 작업 비용 별도 여부",
      "디자인 IP 소유권",
      "납기 지연 시 페널티",
      "친환경 인증서 발급",
    ]
      .map(
        (label, i) =>
          `<g transform="translate(-120 ${-45 + i * 35})">
            <rect x="0" y="-8" width="16" height="16" rx="3" fill="white" stroke="#1E22B2" stroke-width="2"/>
            <path d="M2 0 L7 5 L14 -3" stroke="#06C6C8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="28" y="4" font-family="Pretendard" font-size="13" fill="#1E22B2">${label}</text>
          </g>`
      )
      .join("")}
  </g>
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ 제작 문의 전 5가지만 확인해도 외주 실패를 크게 줄일 수 있습니다.</figcaption>
</figure>`);

// 인지 효과 3원
const FigCognitive = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-100">
<svg viewBox="0 0 720 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  ${[
    { x: 160, label: "기하학적 사고", desc: "평면 → 입체", color: "#06C6C8" },
    { x: 360, label: "소근육 발달", desc: "정교한 손놀림", color: "#F5C518" },
    { x: 560, label: "디자인 사고력", desc: "구조 설계 훈련", color: "#E91E8C" },
  ]
    .map(
      (b) => `<g transform="translate(${b.x},140)">
        <circle cx="0" cy="0" r="70" fill="white" stroke="${b.color}" stroke-width="3"/>
        <circle cx="0" cy="0" r="55" fill="${b.color}" opacity="0.12"/>
        <text x="0" y="-5" text-anchor="middle" font-family="Pretendard" font-size="15" font-weight="800" fill="#1E22B2">${b.label}</text>
        <text x="0" y="18" text-anchor="middle" font-family="Pretendard" font-size="11" fill="#64748B">${b.desc}</text>
      </g>`
    )
    .join("")}
</svg>
<figcaption class="text-xs text-slate-600 text-center py-2 bg-white/60">▲ 페이퍼 엔지니어링은 단일 학습이 아닌 다층적 인지 발달을 동시에 자극합니다.</figcaption>
</figure>`);

// 굿즈 트렌드 비교
const FigGoodsCompare = oneLine(`<figure class="not-prose my-8 rounded-2xl overflow-hidden bg-white border border-slate-200">
<svg viewBox="0 0 720 280" class="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
  <text x="360" y="35" text-anchor="middle" font-family="Pretendard" font-size="15" font-weight="700" fill="#1E22B2">SNS 공유율 & 폐기율 비교 (인하우스 추정)</text>
  ${[
    { y: 80,  label: "텀블러",     share: 80,  trash: 220, fill: "#94A3B8" },
    { y: 130, label: "에코백",     share: 100, trash: 200, fill: "#94A3B8" },
    { y: 180, label: "키링·뱃지", share: 130, trash: 160, fill: "#94A3B8" },
    { y: 230, label: "페이퍼토이", share: 300, trash: 60,  fill: "url(#g1)" },
  ]
    .map(
      (r) => `
        <text x="80" y="${r.y + 6}" font-family="Pretendard" font-size="12" fill="${r.label === "페이퍼토이" ? "#1E22B2" : "#475569"}" font-weight="${r.label === "페이퍼토이" ? "700" : "400"}">${r.label}</text>
        <rect x="160" y="${r.y - 8}" width="${r.share}" height="14" rx="3" fill="${r.fill}"/>
        <text x="${160 + r.share + 6}" y="${r.y + 4}" font-family="Pretendard" font-size="11" fill="#64748B">공유</text>
        <rect x="${300 + r.share}" y="${r.y - 8}" width="${r.trash}" height="14" rx="3" fill="#FECACA"/>
        <text x="${300 + r.share + r.trash + 6}" y="${r.y + 4}" font-family="Pretendard" font-size="11" fill="#B91C1C">폐기</text>
      `
    )
    .join("")}
  <defs><linearGradient id="g1" x1="0%" x2="100%"><stop offset="0%" stop-color="#06C6C8"/><stop offset="100%" stop-color="#E91E8C"/></linearGradient></defs>
</svg>
<figcaption class="text-xs text-slate-500 text-center py-2 bg-slate-50">▲ 페이퍼토이는 받는 사람이 직접 만드는 콘텐츠가 되어 SNS 공유율이 높고, 휴대성·소장성도 높습니다.</figcaption>
</figure>`);

/* ──────────────────────────────────────────────
 * 글 본문
 * ────────────────────────────────────────────── */

export const SEED_POSTS: Post[] = [
  /* ─────────────── 글 1: 지자체 관광 담당자 ─────────────── */
  {
    id: "seed-local-government-paper-toy",
    slug: "local-government-paper-toy-promotion",
    title: "지자체 관광 캐릭터, 페이퍼토이로 만들면 달라지는 3가지",
    excerpt:
      "축제 기념품의 텀블러·에코백 시대는 끝났습니다. 지역 캐릭터 IP를 움직이는 페이퍼토이로 만들면 어떤 일이 일어나는지, 수원시·공주시 사례로 풀어봅니다.",
    tag: "사례 연구",
    emoji: "",
    coverImage: "https://images.unsplash.com/photo-1603929832681-00d8f727063c?w=1200&h=630&fit=crop&crop=faces,center&auto=format&q=80",
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
    content: `많은 지자체가 지역 캐릭터를 가지고 있지만, **캐릭터를 활용하는 방식**은 보통 비슷합니다. 텀블러, 에코백, 키링 — 같은 형태의 굿즈가 도시마다 반복되고, 받는 시민도 "또 이거?"라는 반응을 보입니다.

페이퍼 엔지니어링은 이 지점을 정확히 깨는 솔루션입니다. 종이가 움직이고, 직접 조립하고, SNS에 자랑하게 됩니다.

${FigFestival}

## 1. 캐릭터 IP가 살아나는 순간

평면 일러스트로만 존재하던 지역 캐릭터는 페이퍼토이로 만들어지는 순간 **3D 입체**가 됩니다. 시청 로비 한쪽에 세워둘 수도 있고, 시민이 받아서 자기 책상에 올려둘 수도 있습니다.

PE Studio가 진행한 **수원시 '수원이' 캐릭터 페이퍼토이**, **공주시 '고마곰·공주' 캐릭터 굿즈**는 이 효과를 잘 보여줍니다. 평소 도시 홈페이지에만 존재하던 캐릭터가, 시민의 손에 들어가는 순간 도시 브랜드가 됩니다.

## 2. 같은 예산, 더 많은 시민에게

축제·행사용 기념품의 가장 큰 고민은 **단가**입니다. 텀블러 1,000개를 만들려면 800만원이 들지만, 같은 예산이면 페이퍼토이로 **2,500~4,000개**를 만들 수 있습니다.

${FigCostCompare}

축제 부스에서 "직접 만들어 가세요"라는 체험 요소까지 포함되니, 단순 굿즈가 아니라 **체험 콘텐츠**로 활용됩니다.

## 3. SNS 노출이 따라온다

페이퍼토이는 완성품이 아니라 **조립 과정**이 있습니다. 시민이 직접 만들고, 책상 위에 올려두고 사진을 찍습니다. 인스타그램·블로그에 자연스럽게 노출되며, 이는 광고비 없이 얻는 **유기적 도달**입니다.

특히 움직이는 페이퍼토이는 **숏폼(릴스·쇼츠)** 친화적입니다. 정적인 텀블러 사진보다 움직이는 종이 영상이 알고리즘에 훨씬 잘 노출됩니다.

## 도입을 고려하신다면

PE Studio는 자기 구조 설계 특허 11종을 보유한 지기구조 전문 설계 스튜디오, 페이퍼 엔지니어링 스튜디오 (P.E Studio)입니다. 지자체 캐릭터가 이미 있다면 그대로 활용 가능하고, 캐릭터가 없다면 처음부터 함께 설계합니다. 나라장터·G2B 등록·관공서 납품 경험도 다수 보유하고 있습니다.

- 최소 수량: 1,000부부터
- 평균 납기: 3~4주
- 옵션: OPP 포장 / 벌크 포장, 움직임형 / 고정형, 점착 / 끼우기

축제·행사 일정이 있다면 [무료 견적 페이지](/quote)에서 1분 만에 견적을 받아보세요.`,
  },

  /* ─────────────── 글 2: 교육 담당자 ─────────────── */
  {
    id: "seed-original-steam-paper-engineering-kit",
    slug: "original-steam-paper-engineering-kit-guide",
    title: "학교만의 오리지널 STEAM 교구를 만든다 — 페이퍼 엔지니어링 활용 가이드",
    excerpt:
      "시판 교구로는 차별화가 안 됩니다. 우리 학교/학원만의 오리지널 페이퍼 엔지니어링 교구를 만들면 무엇이 달라지는지, 그리고 의외로 부수적으로 따라오는 SNS 효과까지 정리했습니다.",
    tag: "교육",
    emoji: "",
    coverImage: "https://images.unsplash.com/photo-1766932901295-d4185660341b?w=1200&h=630&fit=crop&crop=faces,center&auto=format&q=80",
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
    content: `시판 STEAM 교구는 어디서나 살 수 있습니다. 즉, 어느 학교나 같은 교구로 수업합니다. **차별점이 없어진다**는 뜻입니다.

페이퍼 엔지니어링은 이 한계를 깨는 가장 빠른 방법입니다. 학교나 학원의 마스코트, 지역 자원, 또는 수업 컨셉에 맞춰 **오리지널 교구**를 만들 수 있습니다.

${FigClassroom}

## 1. "우리 학교만의 것"이 정체성이 된다

학부모가 학교를 평가할 때 가장 강하게 인식되는 것은 **눈에 보이는 차별점**입니다. 시판 키트로는 만들 수 없습니다. 학교 마스코트로 만든 움직이는 페이퍼토이 교구는 첫 수업 한 번으로 학부모 단톡방에 사진이 올라옵니다.

KAIST 출신 개발자와 함께 개발한 PE Studio의 페이퍼 엔지니어링 교구는 단순 만들기가 아닙니다. **도형의 내각, 무게중심, 탄성력** 같은 과학 원리를 캐릭터의 움직임에 직접 적용해 학생이 손으로 배우게 합니다.

## 2. 움직이는 교구가 SNS에 통한다

교육 콘텐츠가 SNS에서 통하기 어려운 이유는 **결과물이 정적**이기 때문입니다. 학생이 만든 결과물이 그 자리에서 움직이면, 학부모가 영상을 찍습니다. 영상은 학원·학교의 가장 자연스러운 광고가 됩니다.

${FigSnsShare}

특히 인스타그램 릴스, 유튜브 쇼츠, 틱톡 같은 숏폼 플랫폼에서 "움직이는 종이"는 알고리즘이 좋아하는 콘텐츠입니다. 광고비 한 푼 없이 잠재 학부모에게 도달합니다.

## 3. 방과 후 프로그램으로 확장 가능

페이퍼 엔지니어링 교구는 단발성 수업으로 끝나지 않습니다. PE Studio는 교구 제작과 함께 **방과 후 교육 프로그램**, **재료 별도 판매**, **교사용 가이드**까지 패키지로 제공합니다.

학원의 경우 자체 교구를 보유함으로써 다음과 같은 부가 수익도 가능합니다.

- 교구 자체 판매 (학원생 외부 수강생 대상)
- 단체 워크숍 운영 (생일 파티·기업 행사)
- 영상 콘텐츠 제작 (자체 유튜브 채널 자산화)

## 도입 절차

1. **상담**: 학교/학원 컨셉, 수업 대상 학년, 교과 연계 포인트 확인 (약 1주)
2. **구조 설계 & 샘플**: 학생 손에 안전하면서도 움직임이 매력적인 메커니즘 설계 (약 1주)
3. **디자인 작업**: 학교 마스코트, 컬러, 학년 수준 반영 (약 1.5주)
4. **생산 & 납품**: 최소 30세트부터 제작 가능 (납기 협의)

학기 시작 전 도입을 검토하신다면 [자동 견적 페이지](/quote)에서 1분 만에 견적을 확인해 보세요.`,
  },

  /* ─────────────── 글 3: AI 시대 인지 효과 ─────────────── */
  {
    id: "seed-ai-era-paper-engineering",
    slug: "ai-era-paper-engineering-cognitive-benefits",
    title: "AI가 다 해주는 시대, 왜 손으로 종이를 만져야 하는가",
    excerpt:
      "생성형 AI가 그림도, 영상도, 글도 만들어주는 시대. 그럴수록 손으로 무언가를 만드는 경험은 더 희소해집니다. 페이퍼 엔지니어링이 길러주는 3가지 사고력을 정리했습니다.",
    tag: "교육",
    emoji: "",
    coverImage: "https://images.unsplash.com/photo-1576616519640-692f49128a59?w=1200&h=630&fit=crop&crop=faces,center&auto=format&q=80",
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
    content: `2026년, ChatGPT·Claude·Midjourney가 아이들 숙제를 대신 해주는 시대입니다. 학부모와 교사 모두 한 가지 고민을 합니다 — **AI 시대에 아이가 키워야 할 능력은 무엇인가?**

답은 역설적입니다. AI가 더 똑똑해질수록, **AI가 못 하는 것**의 가치가 올라갑니다. 그 중 하나가 직접 손으로 무언가를 설계하고 만드는 경험입니다.

${FigHandsPaper}

## 1. 기하학적 사고 — 평면이 입체가 되는 순간

페이퍼 엔지니어링의 핵심은 **평면 전개도가 입체 구조가 되는 변환**입니다. 정육면체의 6개 면을 십자 모양으로 펼친 그림을 보고 머릿속에서 다시 접어 정육면체로 만드는 것 — 이게 **공간 지각력**입니다.

${FigGeometry}

이 능력은 단순 기하 시험 점수가 아니라, 수학·물리·코딩·건축·의학 모든 분야에서 통하는 기초 사고력입니다. 그리고 이건 영상으로 배우는 것보다 **직접 종이를 접어보는 게 압도적으로 효과적**입니다.

## 2. 소근육 발달 — 손이 만드는 뇌

발달학에서 잘 알려진 사실 하나. **손은 두뇌의 또 다른 부위**입니다. 손가락의 정교한 움직임은 뇌의 운동피질·전두엽을 자극하며, 이 자극은 집중력·계획 수립·문제 해결 능력과 직결됩니다.

종이를 접고, 풀로 붙이고, 정확한 위치에 끼우는 작업은 모두 소근육 훈련입니다. 스마트폰이 손가락 운동을 단순 스와이프로 줄이고 있는 시대에, 종이 작업의 가치는 오히려 올라가고 있습니다.

## 3. 디자인적 사고력 — 문제 해결의 원형

페이퍼 엔지니어링은 "어떻게 하면 이 캐릭터가 균형을 잡고 설까?", "어디를 접어야 팔이 움직일까?" 같은 질문의 연속입니다. 이건 **디자인 씽킹의 본질**입니다.

${FigCognitive}

- **관찰 → 가설 → 시도 → 수정**의 반복
- 한 번에 완성되지 않고, 실패를 분석해서 다음 시도가 더 나아지는 경험
- 결과물이 손에 들리는 즉각적 피드백

이런 경험은 AI에게 프롬프트만 던지는 것으로는 절대 만들어지지 않습니다.

## 결론: AI 시대일수록 손을 써야 한다

AI가 결과물을 만드는 능력이 평준화될수록, **결과물을 어떻게 설계할지 사고하는 능력**이 차별점이 됩니다. 그리고 그 사고력은 종이·블록·점토 같은 물성을 다뤄본 사람이 압도적으로 잘 합니다.

학교, 학원, 가정 모두에서 활용 가능한 페이퍼 엔지니어링 교구가 궁금하시다면 [PE Studio 제품 소개](/products)를 확인해 보세요.`,
  },

  /* ─────────────── 글 4: 기업 굿즈 담당자 ─────────────── */
  {
    id: "seed-corporate-paper-goods",
    slug: "corporate-paper-goods-beyond-tumbler",
    title: "기업 굿즈, 텀블러·에코백 다음은? — 움직이는 종이가 SNS에서 통하는 이유",
    excerpt:
      "마케팅팀과 HR팀이 함께 고민하는 문제. 굿즈는 만들어도 SNS에 안 올라오고, 책상 한쪽에 쌓이기만 합니다. 페이퍼 엔지니어링 굿즈가 이 흐름을 바꿀 수 있는 이유.",
    tag: "사례 연구",
    emoji: "",
    coverImage: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=630&fit=crop&crop=faces,center&auto=format&q=80",
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
    content: `대부분의 기업 굿즈는 비슷한 운명을 맞이합니다. 신입사원 환영 키트로 받은 텀블러는 책상 서랍에, 컨퍼런스 굿즈로 받은 에코백은 옷장 구석에. **사용도 안 되고 SNS에도 안 올라옵니다.**

마케팅·HR 담당자가 진짜 원하는 건 두 가지입니다. ① 받은 사람이 실제로 **사용**하거나 **간직**하게, ② SNS에 자발적으로 **노출**되게.

페이퍼 엔지니어링 굿즈가 이 두 가지를 동시에 잡습니다.

${FigGoodsCompare}

## 1. "받자마자 SNS에 올린다"의 메커니즘

페이퍼토이가 SNS에 올라가는 이유는 단순합니다. **공유 욕구가 자동으로 생깁니다.**

- 평소 보지 못한 형태라서 → 신기함
- 직접 만들어서 → 성취감 + 자기 표현 욕구
- 움직여서 → 영상으로 찍을 동기

같은 예산으로 만든 텀블러는 사진을 찍어도 평범한 컵 사진이지만, 움직이는 페이퍼토이는 **3초짜리 영상**이 만들어집니다. 알고리즘은 후자를 압도적으로 더 노출시킵니다.

## 2. 단가 효율 — 같은 예산, 더 많은 임팩트

기업이 굿즈에 쓰는 예산은 보통 정해져 있습니다. 같은 예산으로:

- 텀블러 1,000개 × 8,000원 = 800만원
- 페이퍼토이 1,000개 × 2,500원 = 250만원 → 같은 예산이면 **3,000개 이상** 가능

특히 컨퍼런스·런칭 이벤트처럼 **참가자가 많은 행사**에서는 단가 차이가 결정적입니다. 250만원으로 1,000명에게, 800만원으로 3,000명에게 도달할 수 있습니다.

## 3. 친환경·업사이클링 트렌드와 부합

요즘 기업 ESG·CSR 보고서에서 굿즈는 더 이상 자랑거리가 아닙니다. 비닐·플라스틱·합성섬유 굿즈는 **폐기물 부담**을 만들고, 환경 이슈에 민감한 MZ세대 직원에게는 오히려 마이너스입니다.

페이퍼 엔지니어링 굿즈는:

- FSC 인증지, 재생지, 콩기름 잉크 등 친환경 소재 선택 가능
- 사용 후 분해·재활용 용이
- 업사이클링 컨셉의 메시지 전달 가능 ("종이로도 이런 게 만들어집니다")

ESG 보고서에 사진 한 장으로 좋은 사례가 될 수 있는 굿즈입니다.

## 활용 시나리오

- **신입사원 환영 키트**: 회사 마스코트 페이퍼토이 + 조립 가이드 → 첫 출근 첫 콘텐츠
- **컨퍼런스·런칭 굿즈**: 제품 컨셉을 형상화한 페이퍼토이 → 부스 체험 + SNS 인증
- **연말 고객 선물**: 기업 캐릭터를 일러스트한 한정판 페이퍼토이 → 책상 위 상시 노출
- **임직원 가족의 날**: 자녀가 직접 만들 수 있는 가족용 키트

자세한 단가와 제작 가능 형태는 [무료 견적 페이지](/quote)에서 1분이면 확인할 수 있습니다.`,
  },

  /* ─────────────── 글 5: 외주 체크리스트 ─────────────── */
  {
    id: "seed-outsourcing-checklist",
    slug: "paper-toy-outsourcing-checklist",
    title: "페이퍼토이 외주, 단가표 없는 시장에서 손해 안 보는 5가지 체크포인트",
    excerpt:
      "페이퍼토이 외주 시장은 단가표가 공개되지 않아 견적 사이의 차이가 크게 납니다. 관공서·기업 담당자가 외주를 진행하기 전 반드시 확인해야 할 5가지를 정리했습니다.",
    tag: "제작 과정",
    emoji: "",
    coverImage: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&h=630&fit=crop&crop=faces,center&auto=format&q=80",
    published: true,
    createdAt: NOW,
    updatedAt: NOW,
    content: `페이퍼토이·페이퍼 엔지니어링 외주는 일반 인쇄 외주와 다르게 **표준 단가표가 거의 공개되지 않은 시장**입니다. 같은 사양인데 견적 차이가 2~3배 나는 일도 흔합니다.

처음 외주를 진행하는 관공서·기업 담당자가 자주 놓치는 5가지 체크포인트를 정리했습니다.

${FigChecklist}

## 1. 최소 수량과 단가 구조

가장 먼저 확인해야 할 것. **최소 수량(MOQ)** 이 어디서 시작하는지, **수량별 단가 구간**이 어떻게 변하는지입니다.

예: "1,000부 ○만원" 이라는 견적은 별 정보가 없습니다. 다음처럼 받아야 합니다.

- 1,000부 시 단가
- 3,000부 시 단가
- 5,000부 시 단가
- 10,000부 이상 시 단가

수량 증가에 따른 단가 감소 폭이 큰 업체가 보통 **자체 생산 라인을 보유**한 업체입니다. 단가가 거의 변하지 않으면 외주를 다시 외주하는 업체일 가능성이 큽니다.

## 2. 샘플 작업 비용 별도 여부

본 생산 전 디자인·움직임을 검증하는 **샘플 작업**이 별도 비용인지 확인하세요. 견적서에 "샘플 1회 포함"이 있는지, 추가 샘플은 회당 얼마인지 명시되어야 합니다.

샘플 단계에서 구조가 안 잡힌다면 본 생산은 더 어렵습니다. 샘플을 적극적으로 진행하는 업체가 결국 본 생산 품질도 안정적입니다.

## 3. 디자인 IP 소유권

지자체·관공서 발주는 특히 이 부분이 중요합니다. **제작된 디자인의 저작권이 누구에게 귀속되는지**, 향후 재사용·변형·2차 활용 권한이 어떻게 되는지 계약서에 명확히 적혀 있어야 합니다.

- 발주처 100% 귀속? (가장 일반적)
- 공동 소유?
- 제작사 보유, 발주처 사용권만?

이걸 안 챙기면 다음 해 추가 생산 시 다른 업체에 의뢰하려 해도 디자인을 못 쓰는 상황이 생깁니다.

## 4. 납기 지연 시 페널티 조항

축제·런칭처럼 **일정이 고정된 행사**라면 납기 지연이 치명적입니다. 계약서에 다음을 확인하세요.

- 약정 납기일
- 지연 시 일자별 페널티 (전체 금액의 ○%/일)
- 지연 사유 책임 소재 (천재지변·자재 수급·발주처 변경 요청 등 구분)

페널티 조항을 거부하는 업체는 일정 리스크가 크다는 신호입니다.

## 5. 친환경·인증서 발급 여부

기관·기업 ESG 보고서, 학교·교육기관 친환경 인증, 어린이용 안전 인증 등이 필요하다면 견적 단계에서 미리 확인해야 합니다.

- FSC 인증지 사용 가능 여부
- KC 안전 인증 (어린이용)
- 친환경 잉크 사용 여부
- 인증서 발급 비용 (보통 별도)

특히 **어린이가 만지는 교구**라면 KC 인증 없이는 학교·교육청 납품 자체가 불가능한 경우가 많습니다.

## PE Studio의 표준 견적 정책

PE Studio는 위 5가지 항목을 견적 단계에서 **모두 명시**합니다.

- 1,000 / 3,000 / 5,000 / 10,000부 단가 모두 제시
- 샘플 1회 포함, 추가 샘플 비용 별도 명시
- 디자인 IP 발주처 100% 귀속 (기본)
- 납기 지연 시 페널티 조항 표준 포함
- FSC·KC 인증 발급 가능 (별도 비용 명시)

자동 견적 페이지에서 1분이면 위 항목이 포함된 견적을 받아볼 수 있습니다.

[무료 견적 받기 →](/quote)`,
  },
];
