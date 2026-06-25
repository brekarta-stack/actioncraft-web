import type { ReactNode } from "react";
import { PaperToyHero, PaperNetBg } from "@/components/paper-art";

/**
 * 하위 페이지 공용 상단 헤더(히어로 밴드).
 *
 * 모든 하위 페이지(회사소개·주문제작·납품사례·다운로드·블로그)가 동일한
 * 높이·구조를 갖도록 통일한다. 인디고 밴드 + 우측 종이 로봇 캐릭터.
 *
 * @param eyebrow  상단 작은 배지 라벨 (예: "회사소개")
 * @param title    h1 제목 — ReactNode 허용(그라데이션 span·줄바꿈 등 그대로 전달)
 * @param subtitle 부제 (선택)
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#1E22B2" }}>
      {/* 전개도 패턴 — 은은한 배경 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[55%] max-w-2xl rotate-6">
          <PaperNetBg className="w-full h-auto" />
        </div>
      </div>

      {/* 종이 로봇 캐릭터 — 우측 (lg+에서만, 텍스트와 겹치지 않게) */}
      <div className="hidden lg:block absolute right-2 xl:right-12 top-0 bottom-0 w-[260px] xl:w-[320px] pointer-events-none">
        <PaperToyHero className="w-full h-full" />
      </div>

      {/* 콘텐츠 — 통일 높이(min-h) + 세로 중앙 정렬 */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[300px] md:min-h-[360px] flex items-center">
        <div className="max-w-xl lg:max-w-2xl py-16">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full mb-6 bg-white/10 text-white border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-[1.15] tracking-tight"
            style={{ wordBreak: "keep-all" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-blue-200 text-lg leading-relaxed"
              style={{ wordBreak: "keep-all" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
