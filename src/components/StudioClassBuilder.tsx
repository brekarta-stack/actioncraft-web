"use client";

/**
 * 학급 세트 빌더 (웹 M4) — 모형×수량을 담아 총 준비량을 계산하고,
 * 묶음 인쇄 PDF 와 상태 없는 공유 링크(URL=세트)를 만든다.
 * 세트는 URL(items=)과 localStorage 에 함께 반영: 링크를 받은 학생·동료는
 * 로그인 없이 같은 세트를 그대로 본다.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CLASS_MAX_ITEMS,
  CLASS_MAX_QTY,
  CLASS_MAX_SHEETS,
  decodeClassItems,
  encodeClassItems,
} from "@/lib/studio-class-shared.mjs";
import type { StudioItem } from "@/lib/studio";

export const CART_KEY = "studio_class_cart";

interface Row {
  skey: string;
  qty: number;
}

export type ClassItem = Pick<
  StudioItem,
  "skey" | "name_ko" | "category" | "pdf_pages" | "stars" | "est_minutes"
> & { thumb: string };

const starsLabel = (n: number) => "★".repeat(Math.max(1, Math.min(5, n)));

export default function StudioClassBuilder({ items }: { items: ClassItem[] }) {
  const bySkey = useMemo(() => new Map(items.map((i) => [i.skey, i])), [items]);
  const [rows, setRows] = useState<Row[]>([]);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [catSel, setCatSel] = useState("");
  const [addSel, setAddSel] = useState("");
  const loaded = useRef(false);

  // 초기값: URL ?items= 가 있으면 그것(공유 링크), 없으면 담아 둔 카트.
  useEffect(() => {
    const fromUrl = decodeClassItems(
      new URLSearchParams(window.location.search).get("items"),
    ).filter((r) => bySkey.has(r.skey));
    if (fromUrl.length) {
      setRows(fromUrl);
    } else {
      try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as Row[];
        setRows(decodeClassItems(encodeClassItems(cart)).filter((r) => bySkey.has(r.skey)));
      } catch {}
    }
    loaded.current = true;
  }, [bySkey]);

  // 변경 시 URL(공유 링크)과 카트를 함께 갱신 — 서버 저장 없음.
  useEffect(() => {
    if (!loaded.current) return;
    const enc = encodeClassItems(rows);
    const url = enc ? `?items=${enc}` : window.location.pathname;
    window.history.replaceState(null, "", enc ? url : window.location.pathname);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(rows));
    } catch {}
  }, [rows]);

  const totals = useMemo(() => {
    let students = 0;
    let sheets = 0;
    let minT = Infinity;
    let maxT = 0;
    for (const r of rows) {
      const it = bySkey.get(r.skey);
      if (!it) continue;
      students += r.qty;
      sheets += it.pdf_pages * r.qty;
      minT = Math.min(minT, it.est_minutes);
      maxT = Math.max(maxT, it.est_minutes);
    }
    return { students, sheets, minT: rows.length ? minT : 0, maxT };
  }, [rows, bySkey]);

  function setQty(skey: string, qty: number) {
    setRows((rs) =>
      rs.map((r) =>
        r.skey === skey ? { ...r, qty: Math.min(CLASS_MAX_QTY, Math.max(1, qty)) } : r,
      ),
    );
  }

  function add() {
    if (!addSel || rows.some((r) => r.skey === addSel)) return;
    if (rows.length >= CLASS_MAX_ITEMS) {
      setNotice(`모형은 ${CLASS_MAX_ITEMS}종까지 담을 수 있어요.`);
      return;
    }
    setRows((rs) => [...rs, { skey: addSel, qty: 1 }]);
    setAddSel("");
    setNotice("");
  }

  async function downloadPdf() {
    setPdfBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/studio/class/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: rows }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setNotice(j.error ?? `묶음 PDF 생성 실패 (HTTP ${r.status})`);
        return;
      }
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "학급 세트 종이모형 (papercraft.kr).pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setNotice("네트워크 오류로 PDF 를 받지 못했습니다.");
    } finally {
      setPdfBusy(false);
    }
  }

  async function copyShare() {
    const enc = encodeClassItems(rows);
    const url = `${window.location.origin}/studio/class?items=${enc}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("공유 링크를 복사했어요. 학생·동료에게 그대로 보내면 됩니다.");
    } catch {
      setNotice(`이 주소를 복사해 주세요: ${url}`);
    }
  }

  const categories = useMemo(() => {
    const m = new Map<string, ClassItem[]>();
    for (const it of items) {
      if (!m.has(it.category)) m.set(it.category, []);
      m.get(it.category)!.push(it);
    }
    return [...m.entries()];
  }, [items]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      <div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {/* 탐색 동선: 분류 먼저 고르면 모형 목록이 그 분류로 좁혀진다 (124종 한 줄 셀렉트는 못 찾음) */}
          <div className="grid gap-3 sm:grid-cols-[minmax(9rem,auto)_1fr_auto] sm:items-end">
            <label>
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">분류</span>
              <select
                value={catSel}
                onChange={(e) => {
                  setCatSel(e.target.value);
                  setAddSel("");
                }}
                data-track="studio_class_cat"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">— 분류 —</option>
                {categories.map(([cat, list]) => (
                  <option key={cat} value={cat}>
                    {cat} ({list.length})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="block text-sm font-semibold text-slate-700 mb-1.5">모형</span>
              <select
                value={addSel}
                onChange={(e) => setAddSel(e.target.value)}
                disabled={!catSel}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{catSel ? "— 모형을 고르세요 —" : "분류를 먼저 고르세요"}</option>
                {(categories.find(([c]) => c === catSel)?.[1] ?? []).map((it) => (
                  <option key={it.skey} value={it.skey} disabled={rows.some((r) => r.skey === it.skey)}>
                    {it.name_ko} · {starsLabel(it.stars)} · A4 {it.pdf_pages}장
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={add}
              disabled={!addSel}
              data-track="studio_class_add"
              className="rounded-xl bg-[var(--pe-blue,#1a73e8)] px-5 py-2 text-sm text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              담기
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500"
               style={{ wordBreak: "keep-all" }}>
            아직 담긴 모형이 없어요. 위에서 모형을 고르거나,{" "}
            <Link href="/studio" className="underline underline-offset-2">카탈로그</Link>
            의 각 모형에서 「학급 세트에 담기」를 눌러 보세요.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((r) => {
              const it = bySkey.get(r.skey)!;
              return (
                <li key={r.skey}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                  <Image
                    src={it.thumb}
                    alt={it.name_ko}
                    width={64}
                    height={64}
                    unoptimized
                    className="rounded-lg border border-slate-100"
                  />
                  <div className="grow min-w-0">
                    <Link href={`/studio/${it.skey}`} className="font-semibold hover:underline"
                          style={{ wordBreak: "keep-all" }}>
                      {it.name_ko}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {starsLabel(it.stars)} · A4 {it.pdf_pages}장/명 · 약 {it.est_minutes}분
                    </div>
                  </div>
                  <Link
                    href={`/studio/${it.skey}/custom`}
                    data-track={`studio_class_custom:${it.skey}`}
                    className="inline-flex items-center gap-1 rounded-xl border-2 border-[var(--pe-blue,#1a73e8)] px-3 py-1.5 text-sm font-semibold text-[var(--pe-blue,#1a73e8)] hover:bg-blue-50 whitespace-nowrap"
                  >
                    🎨 꾸미기
                  </Link>
                  <label className="flex items-center gap-1.5 text-sm">
                    <span className="text-slate-500">수량</span>
                    <input
                      type="number"
                      min={1}
                      max={CLASS_MAX_QTY}
                      value={r.qty}
                      onChange={(e) => setQty(r.skey, Number(e.target.value))}
                      className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-right tabular-nums"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((x) => x.skey !== r.skey))}
                    aria-label={`${it.name_ko} 빼기`}
                    data-track="studio_class_remove"
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-6">
        <h2 className="font-bold" style={{ wordBreak: "keep-all" }}>준비 요약</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">모형</dt>
            <dd className="font-semibold tabular-nums">{rows.length}종</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">수량 합(학생 수)</dt>
            <dd className="font-semibold tabular-nums">{totals.students}명</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">총 인쇄 장수</dt>
            <dd className="font-semibold tabular-nums">A4 {totals.sheets}장</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">만들기 시간 가늠</dt>
            <dd className="font-semibold tabular-nums">
              {rows.length ? `${totals.minT}~${totals.maxT}분` : "-"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
          준비물: 가위(또는 칼), 풀(딱풀 권장), 두꺼운 A4 용지(120g 이상 권장).
          도면의 실선은 자르고 점선은 접습니다.
        </p>
        {totals.sheets > CLASS_MAX_SHEETS && (
          <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800"
             style={{ wordBreak: "keep-all" }}>
            묶음 인쇄는 총 {CLASS_MAX_SHEETS}장까지예요. 수량을 줄이거나 세트를
            나눠 주세요.
          </p>
        )}
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={rows.length === 0 || pdfBusy || totals.sheets > CLASS_MAX_SHEETS}
            data-track="studio_class_pdf"
            className="rounded-xl bg-[var(--pe-blue,#1a73e8)] px-5 py-2.5 text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {pdfBusy ? "묶는 중…" : "묶음 인쇄 PDF 내려받기"}
          </button>
          <button
            type="button"
            onClick={copyShare}
            disabled={rows.length === 0}
            data-track="studio_class_share"
            className="rounded-xl border-2 border-[var(--pe-blue,#1a73e8)] px-5 py-2.5 text-[var(--pe-blue,#1a73e8)] font-semibold hover:bg-blue-50 disabled:opacity-50"
          >
            수업 공유 링크 복사
          </button>
          <button
            type="button"
            onClick={() => setRows([])}
            disabled={rows.length === 0}
            data-track="studio_class_clear"
            className="rounded-xl px-5 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            비우기
          </button>
        </div>
        {notice && (
          <p className="mt-3 text-xs text-slate-600" style={{ wordBreak: "keep-all" }}>
            {notice}
          </p>
        )}
      </aside>
    </div>
  );
}
