"use client";

/**
 * /studio 카탈로그 — 검색·분류·난이도 필터 (M2 트랙 A).
 * 데이터는 서버에서 정적 index.json 을 통째로 받아(수백 KB 미만) 클라이언트에서
 * 즉시 거른다 — 요청 없음. 상단 8장은 priority 로딩(LCP 게이트: lazy 금지).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { StudioItem } from "@/lib/studio";
import { starsLabel, studioAsset } from "@/lib/studio";

const DIFF_CHIPS = [
  { key: "all", label: "난이도 전체", test: () => true },
  { key: "easy", label: "쉬움 ★~★★", test: (s: number) => s <= 2 },
  { key: "mid", label: "보통 ★★★", test: (s: number) => s === 3 },
  { key: "hard", label: "어려움 ★★★★~", test: (s: number) => s >= 4 },
] as const;

export default function StudioCatalog({ items }: { items: StudioItem[] }) {
  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items],
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("전체");
  const [diff, setDiff] = useState<(typeof DIFF_CHIPS)[number]["key"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim();
    const diffTest = DIFF_CHIPS.find((d) => d.key === diff)!.test;
    return items.filter(
      (i) =>
        (category === "전체" || i.category === category) &&
        diffTest(i.stars) &&
        (!q || i.name_ko.includes(q)),
    );
  }, [items, query, category, diff]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
    }`;

  return (
    <div>
      {/* 부제 + 검색 (같은 라인, 검색은 우측 상단) */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-600" style={{ wordBreak: "keep-all" }}>
          3D로 미리 돌려 보고, 도면을 확인하고, 인쇄해서 바로 만들어 보세요.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="모델 이름 검색 (예: 코끼리, 에펠탑)"
          aria-label="종이모형 검색"
          className="w-full shrink-0 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 sm:w-72"
        />
      </div>

      {/* 진입 버튼 3개 (같은 라인) */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/studio/upload"
          data-track="studio_to_upload"
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--pe-blue,#1a73e8)] px-4 py-2 text-sm font-semibold text-[var(--pe-blue,#1a73e8)] hover:bg-blue-50"
        >
          ⬆ 내 3D 모델 올려서 전개하기 (베타)
        </Link>
        <Link
          href="/studio/class"
          data-track="studio_to_class"
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          🏫 학급 세트 만들기 — 선생님용 (베타)
        </Link>
        <Link
          href="/download"
          data-track="studio_to_download"
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          💻 데스크톱 앱 다운받기
        </Link>
      </div>

      {/* 필터 */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(category === "전체")}
                  onClick={() => setCategory("전체")} data-track="studio_filter_cat:전체">
            전체
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className={chip(category === c)}
                    onClick={() => setCategory(c)} data-track={`studio_filter_cat:${c}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {DIFF_CHIPS.map((d) => (
            <button key={d.key} type="button" className={chip(diff === d.key)}
                    onClick={() => setDiff(d.key)} data-track={`studio_filter_diff:${d.key}`}>
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 tabular-nums">{filtered.length}종</p>
      </div>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-500" style={{ wordBreak: "keep-all" }}>
          조건에 맞는 모형이 없어요. 검색어나 필터를 바꿔 보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((it, idx) => (
            <Link
              key={it.skey}
              href={`/studio/${it.skey}`}
              className="pe-paper-lift group block rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition-shadow"
              aria-label={`${it.name_ko} 종이모형 — 상세 보기`}
            >
              <div className="relative aspect-square bg-[#26282c]">
                {/* 썸네일은 이미 480px·~7KB PNG — next/image 변환(콜드 수백 ms)이
                    LCP 를 늦춰 unoptimized 로 CDN 정적 직접 서빙 (Lighthouse 게이트) */}
                <Image
                  src={studioAsset(it.skey, "thumb.png")}
                  alt={`${it.name_ko} 종이모형 3D 미리보기`}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  priority={idx < 8}
                  unoptimized
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <div className="font-semibold" style={{ wordBreak: "keep-all" }}>
                  {it.name_ko}
                </div>
                <div className="mt-1 text-xs text-slate-500 tabular-nums">
                  조각 {it.pieces} · A4 {it.pdf_pages}장 ·{" "}
                  <span className="text-amber-500" aria-label={`난이도 ${it.stars}단계`}>
                    {starsLabel(it.stars)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
