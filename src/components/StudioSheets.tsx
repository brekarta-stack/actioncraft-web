"use client";

/**
 * 도면 미리보기 페이저 — 시트별 워터마크 SVG 를 한 장씩 넘겨 본다.
 * SVG 는 파일 자체에 papercraft.kr 워터마크가 구워져 있다(무료 미리보기 정책).
 */

import { useState } from "react";

export default function StudioSheets({
  base,
  sheets,
  name,
}: {
  base: string;      // /studio/<ver>/<skey>
  sheets: number;    // preview_p1..pN
  name: string;
}) {
  const [n, setN] = useState(1);
  const prev = () => setN((v) => Math.max(1, v - 1));
  const next = () => setN((v) => Math.min(sheets, v + 1));

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        {/* A4 비율(210:297)을 미리 예약해 로드 시 레이아웃 밀림(CLS) 방지.
            첫 장은 LCP 요소라 eager + 높은 fetch 우선순위 (Lighthouse 게이트). */}
        <div className="relative w-full" style={{ aspectRatio: "210 / 297" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${base}/preview_p${n}.svg`}
            alt={`${name} 도면 ${n}쪽 미리보기 (papercraft.kr 워터마크)`}
            className="absolute inset-0 w-full h-full"
            loading={n === 1 ? "eager" : "lazy"}
            fetchPriority={n === 1 ? "high" : undefined}
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-sm">
        <button
          type="button"
          onClick={prev}
          disabled={n <= 1}
          data-track="studio_sheet_prev"
          className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
          aria-label="이전 도면"
        >
          ◀ 이전
        </button>
        <span className="text-slate-600 tabular-nums">
          {n} / {sheets} 장
        </span>
        <button
          type="button"
          onClick={next}
          disabled={n >= sheets}
          data-track="studio_sheet_next"
          className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
          aria-label="다음 도면"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}
