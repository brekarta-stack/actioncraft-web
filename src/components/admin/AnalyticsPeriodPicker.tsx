"use client";

/**
 * 유입·클릭 분석 기간 선택기.
 * - 기본: 이번 달(월별)
 * - 프리셋: 최근 30일 / 90일 / 올해 / 전체
 * - 특정 월 선택(최근 12개월)
 * - 사용자 지정 기간(시작~종료)
 *
 * 선택값을 URL searchParams(month / preset / from+to)로 반영하면
 * 서버 컴포넌트(page.tsx)가 resolvePeriod 로 구간을 다시 계산해 렌더.
 */

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function PeriodPickerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const month = sp.get("month") ?? "";
  const preset = sp.get("preset") ?? "";
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const isDefault = !month && !preset && !from && !to;

  const [cf, setCf] = useState(from);
  const [ct, setCt] = useState(to);

  function go(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const qs = q.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  // 최근 12개월 (현재월 포함, 최신순)
  const months = useMemo(() => {
    const arr: string[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      d.setMonth(d.getMonth() - 1);
    }
    return arr;
  }, []);

  const presets: { k: string; label: string; active: boolean }[] = [
    { k: "", label: "이번 달", active: isDefault },
    { k: "30d", label: "최근 30일", active: preset === "30d" },
    { k: "90d", label: "최근 90일", active: preset === "90d" },
    { k: "year", label: "올해", active: preset === "year" },
    { k: "all", label: "전체", active: preset === "all" },
  ];

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
      active
        ? "text-white"
        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
    }`;

  return (
    <div className="flex flex-col gap-2 items-end">
      {/* 프리셋 */}
      <div className="flex flex-wrap gap-1.5 justify-end">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => go(p.k ? { preset: p.k } : {})}
            className={chip(p.active)}
            style={p.active ? { background: "#1E22B2" } : undefined}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 월 선택 + 사용자 지정 기간 */}
      <div className="flex flex-wrap gap-1.5 justify-end items-center">
        <select
          value={month}
          onChange={(e) => (e.target.value ? go({ month: e.target.value }) : go({}))}
          className={`px-2.5 py-1.5 rounded-lg border text-xs ${
            month ? "border-slate-400 text-slate-800 font-semibold" : "border-slate-200 text-slate-600"
          }`}
        >
          <option value="">월 선택…</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m.replace("-", "년 ")}월
            </option>
          ))}
        </select>

        <span className="text-slate-300 mx-0.5">|</span>

        <input
          type="date"
          value={cf}
          max={ct || undefined}
          onChange={(e) => setCf(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
          aria-label="시작일"
        />
        <span className="text-slate-400 text-xs">~</span>
        <input
          type="date"
          value={ct}
          min={cf || undefined}
          onChange={(e) => setCt(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
          aria-label="종료일"
        />
        <button
          type="button"
          onClick={() => cf && ct && go({ from: cf, to: ct })}
          disabled={!cf || !ct}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40"
          style={{ background: "#1E22B2" }}
        >
          조회
        </button>
      </div>
    </div>
  );
}

export default function AnalyticsPeriodPicker() {
  // useSearchParams 는 Suspense 경계 안에서 사용 (정적 렌더 경고 방지)
  return (
    <Suspense fallback={<div className="h-16" />}>
      <PeriodPickerInner />
    </Suspense>
  );
}
