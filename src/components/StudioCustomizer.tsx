"use client";

/**
 * 웹 꾸미기 에디터 (M2 트랙B) — 클린 시트 SVG 위에 색칠·글자·로고를 얹어
 * 브라우저에서 실측(A4) 인쇄한다. 서버 계산 없음.
 *
 * 동작 원리:
 *  · /api/studio/sheet/<key>/<n> 의 클린 SVG(mm viewBox)를 인라인 주입
 *  · /api/studio/net/<key> 의 도면 JSON(면 좌표·시트 배치·여백)으로 각 시트에
 *    부품별 색칠 오버레이 <g data-part>(반투명 polygon)를 같은 mm 좌표로 그림
 *  · 글자/로고는 클릭 좌표(getScreenCTM 역변환 → mm)로 SVG 요소 추가, 드래그 이동
 *  · 크기 50~100% = 시트 안 내용물을 페이지 중심 기준 scale (배치 유지 축소 인쇄)
 *  · 저장 = localStorage (회원 없음 — 이 브라우저에 유지), 인쇄 = window.print
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface NetFace { verts: [number, number][] }
interface NetPart { index: number; faces: NetFace[] }
interface NetSheet { page_index: number; placements: [number, number, number, number][] }
interface NetJson {
  metadata?: { margin_mm?: [number, number] };
  part_nets: NetPart[];
  sheets: NetSheet[];
}

interface TextDeco { sheet: number; x: number; y: number; size: number; str: string; color: string }
interface ImageDeco { sheet: number; x: number; y: number; w: number; h: number; data: string }
interface SavedState {
  fills: Record<string, string>;
  texts: TextDeco[];
  images: ImageDeco[];
  scale: number;
}

const SVGNS = "http://www.w3.org/2000/svg";
const PALETTE = ["#e5484d", "#f76b15", "#ffc53d", "#46a758", "#00a2c7",
                 "#3e63dd", "#8e4ec6", "#e93d82", "#8d6e63", "#607d8b"];
// 스티커 = 이모지 글리프 텍스트 데코 — 끌기·두 번 콕 삭제를 글자와 똑같이 상속한다
const STICKERS = ["⭐", "❤️", "😊", "🌈", "🌸", "🦋", "🚀", "👑", "⚡", "🍀", "🎵", "🐾"];
const HINTS: Record<string, string> = {
  color: "색을 고르고, 도면 조각을 콕! 누르면 색칠돼요",
  erase: "지우고 싶은 조각을 콕! 누르면 색이 지워져요",
  text: "글자를 쓰고, 넣고 싶은 곳을 콕! 눌러요",
  sticker: "스티커를 고르고, 붙일 곳을 콕! 눌러요",
};

/**
 * 데이터 소스는 전부 URL 로 주입한다 — 카탈로그(/api/studio/sheet·net)와
 * 업로드 결과(/api/studio/job/<id>/file/…)가 같은 에디터를 쓴다.
 * sheetUrlTemplate 의 "{n}" 이 시트 번호(1..sheets)로 치환된다.
 */
export default function StudioCustomizer({ name, sheets, netUrl, sheetUrlTemplate, storageKey, trackId }: {
  name: string;
  sheets: number;
  netUrl: string;
  sheetUrlTemplate: string;
  storageKey: string;
  trackId: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SavedState>({ fills: {}, texts: [], images: [], scale: 100 });
  const dragRef = useRef<{ el: SVGGraphicsElement; dx: number; dy: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"color" | "erase" | "text" | "sticker" | null>("color");
  const [color, setColor] = useState(PALETTE[0]);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [text, setText] = useState("");
  const [textSize, setTextSize] = useState(8);
  const [scale, setScale] = useState(100);
  const [savedAt, setSavedAt] = useState("");

  /* mm 좌표 변환: 클릭 지점 → 해당 시트 SVG 의 사용자 좌표(mm) */
  const toMM = (svg: SVGSVGElement, clientX: number, clientY: number) => {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const persist = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateRef.current));
      setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false }));
    } catch { /* 저장 실패는 치명적이지 않음 */ }
  }, [storageKey]);

  const applyFill = useCallback((part: string, fill: string | null) => {
    const host = hostRef.current;
    if (!host) return;
    host.querySelectorAll(`g.pc-overlay [data-part="${part}"] polygon`).forEach((p) => {
      if (fill) {
        p.setAttribute("fill", fill);
        p.setAttribute("fill-opacity", "0.5");
      } else {
        p.setAttribute("fill", "transparent");
        p.removeAttribute("fill-opacity");
      }
    });
    if (fill) stateRef.current.fills[part] = fill;
    else delete stateRef.current.fills[part];
  }, []);

  const addText = useCallback((svg: SVGSVGElement, sheet: number, d: TextDeco, track = true) => {
    const t = document.createElementNS(SVGNS, "text");
    t.textContent = d.str;
    t.setAttribute("x", String(d.x));
    t.setAttribute("y", String(d.y));
    t.setAttribute("font-size", String(d.size));
    t.setAttribute("fill", d.color);
    t.setAttribute("font-family", "sans-serif");
    t.setAttribute("font-weight", "600");
    t.setAttribute("class", "pc-deco pc-text");
    t.style.cursor = "move";
    svg.querySelector("g.pc-net")!.appendChild(t);
    if (track) { stateRef.current.texts.push(d); persist(); }
    (t as unknown as { __deco: TextDeco }).__deco = d;
  }, [persist]);

  const addImage = useCallback((svg: SVGSVGElement, sheet: number, d: ImageDeco, track = true) => {
    const im = document.createElementNS(SVGNS, "image");
    im.setAttribute("href", d.data);
    im.setAttribute("x", String(d.x));
    im.setAttribute("y", String(d.y));
    im.setAttribute("width", String(d.w));
    im.setAttribute("height", String(d.h));
    im.setAttribute("class", "pc-deco pc-image");
    im.style.cursor = "move";
    svg.querySelector("g.pc-net")!.appendChild(im);
    if (track) { stateRef.current.images.push(d); persist(); }
    (im as unknown as { __deco: ImageDeco }).__deco = d;
  }, [persist]);

  const applyScale = useCallback((pct: number) => {
    const host = hostRef.current;
    if (!host) return;
    host.querySelectorAll<SVGSVGElement>("svg.pc-sheet-svg").forEach((svg) => {
      const g = svg.querySelector<SVGGElement>("g.pc-net");
      if (!g) return;
      const vb = svg.viewBox.baseVal;
      const cx = vb.width / 2, cy = vb.height / 2, s = pct / 100;
      g.setAttribute("transform",
        `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
    });
    stateRef.current.scale = pct;
  }, []);

  /* ── 초기 로드: 시트 SVG 주입 + 오버레이 구성 + 저장분 복원 ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const netRes = await fetch(netUrl);
        if (!netRes.ok) throw new Error("도면 데이터를 불러오지 못했습니다.");
        const net: NetJson = await netRes.json();
        const [mlx, mty] = net.metadata?.margin_mm ?? [11.3, 25.4];
        const svgs: string[] = [];
        for (let n = 1; n <= sheets; n++) {
          const r = await fetch(sheetUrlTemplate.replace("{n}", String(n)));
          if (!r.ok) throw new Error(`시트 ${n}을 불러오지 못했습니다.`);
          svgs.push(await r.text());
        }
        if (!alive || !hostRef.current) return;
        hostRef.current.innerHTML = svgs
          .map((s, i) => `<div class="pc-sheet" data-sheet="${i}">${
            s.replace("<svg ", '<svg class="pc-sheet-svg" ')}</div>`)
          .join("");

        // 시트마다: 페이지 rect 를 제외한 전부를 g.pc-net 으로 감싸고(크기 % 대상),
        // 그 위에 색칠 오버레이(g.pc-overlay > g[data-part] > polygon)를 얹는다.
        const parts = new Map(net.part_nets.map((p) => [p.index, p]));
        hostRef.current.querySelectorAll<SVGSVGElement>("svg.pc-sheet-svg").forEach((svg, si) => {
          const wrap = document.createElementNS(SVGNS, "g");
          wrap.setAttribute("class", "pc-net");
          const keep: Element[] = [];
          [...svg.children].forEach((ch, i) => {
            if (i === 0 && ch.tagName === "rect") keep.push(ch);   // 페이지 배경
            else wrap.appendChild(ch);
          });
          svg.appendChild(wrap);

          const overlay = document.createElementNS(SVGNS, "g");
          overlay.setAttribute("class", "pc-overlay");
          const sheet = net.sheets[si];
          for (const [idx, ox, oy] of sheet?.placements ?? []) {
            const part = parts.get(idx);
            if (!part) continue;
            const pg = document.createElementNS(SVGNS, "g");
            pg.setAttribute("data-part", String(idx));
            for (const f of part.faces) {
              const poly = document.createElementNS(SVGNS, "polygon");
              poly.setAttribute("points",
                f.verts.map(([x, y]) => `${(mlx + ox + x).toFixed(2)},${(mty + oy + y).toFixed(2)}`).join(" "));
              poly.setAttribute("fill", "transparent");
              poly.setAttribute("stroke", "none");
              poly.setAttribute("pointer-events", "all");
              pg.appendChild(poly);
            }
            overlay.appendChild(pg);
          }
          wrap.appendChild(overlay);
        });

        // 저장분 복원
        try {
          const saved: SavedState | null = JSON.parse(localStorage.getItem(storageKey) || "null");
          if (saved) {
            stateRef.current = { fills: {}, texts: [], images: [], scale: saved.scale ?? 100 };
            for (const [part, fill] of Object.entries(saved.fills ?? {})) applyFill(part, fill);
            stateRef.current.fills = { ...(saved.fills ?? {}) };
            const svgEls = hostRef.current.querySelectorAll<SVGSVGElement>("svg.pc-sheet-svg");
            for (const t of saved.texts ?? []) svgEls[t.sheet] && addText(svgEls[t.sheet], t.sheet, t, false);
            for (const im of saved.images ?? []) svgEls[im.sheet] && addImage(svgEls[im.sheet], im.sheet, im, false);
            stateRef.current.texts = [...(saved.texts ?? [])];
            stateRef.current.images = [...(saved.images ?? [])];
            setScale(stateRef.current.scale);
            applyScale(stateRef.current.scale);
          }
        } catch { /* 복원 실패 시 새로 시작 */ }
        setReady(true);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "불러오기 실패");
      }
    })();
    return () => { alive = false; };
  }, [netUrl, sheetUrlTemplate, sheets, storageKey, applyFill, addText, addImage, applyScale]);

  /* ── 시트 클릭/드래그 (색칠·글자 배치·장식 이동/삭제) ── */
  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    const svg = target.closest("svg.pc-sheet-svg") as SVGSVGElement | null;
    if (!svg) return;
    const sheetEl = svg.closest(".pc-sheet") as HTMLElement;
    const sheet = Number(sheetEl?.dataset.sheet ?? 0);

    // 장식 드래그 시작
    if (target.classList.contains("pc-deco")) {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      const el = target as SVGGraphicsElement;
      const x = Number(el.getAttribute("x") || 0);
      const y = Number(el.getAttribute("y") || 0);
      dragRef.current = { el, dx: mm.x - x, dy: mm.y - y };
      e.preventDefault();
      return;
    }
    // 색칠 / 지우기
    const partG = target.closest("g[data-part]");
    if (partG && (mode === "color" || mode === "erase")) {
      applyFill(partG.getAttribute("data-part")!, mode === "color" ? color : null);
      persist();
      return;
    }
    // 글자 배치
    if (mode === "text" && text.trim()) {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      addText(svg, sheet, { sheet, x: mm.x, y: mm.y, size: textSize, str: text.trim(), color });
      return;
    }
    // 스티커 붙이기 (이모지 텍스트 데코 — 이동·삭제는 글자와 동일)
    if (mode === "sticker") {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      addText(svg, sheet, { sheet, x: mm.x, y: mm.y, size: 12, str: sticker, color });
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const svg = d.el.closest("svg.pc-sheet-svg") as SVGSVGElement;
    const mm = toMM(svg, e.clientX, e.clientY);
    if (!mm) return;
    const nx = mm.x - d.dx, ny = mm.y - d.dy;
    d.el.setAttribute("x", String(nx));
    d.el.setAttribute("y", String(ny));
    const deco = (d.el as unknown as { __deco?: TextDeco | ImageDeco }).__deco;
    if (deco) { deco.x = nx; deco.y = ny; }
  };
  const onPointerUp = () => {
    if (dragRef.current) { dragRef.current = null; persist(); }
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (!target.classList.contains("pc-deco")) return;
    const deco = (target as unknown as { __deco?: TextDeco | ImageDeco }).__deco;
    stateRef.current.texts = stateRef.current.texts.filter((t) => t !== deco);
    stateRef.current.images = stateRef.current.images.filter((t) => t !== deco);
    target.remove();
    persist();
  };

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const svg = hostRef.current?.querySelector<SVGSVGElement>("svg.pc-sheet-svg");
      if (!svg || typeof reader.result !== "string") return;
      addImage(svg, 0, { sheet: 0, x: 80, y: 120, w: 50, h: 50, data: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const resetAll = () => {
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
    location.reload();
  };

  // 아동 친화 도구 버튼 — 이모지 아이콘+큰 터치 목표(44px+), 선택 시 파란 배경
  const tool = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 text-base font-semibold transition-colors ${
      active ? "bg-[var(--pe-blue,#1a73e8)] text-white border-[var(--pe-blue,#1a73e8)]"
             : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`;

  return (
    <div>
      {/* ── 도구막대 (인쇄 시 숨김) ── */}
      <div className="pc-toolbar sticky top-2 z-10 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-3 space-y-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={tool(mode === "color")} data-track="studio_custom_mode_color"
                  onClick={() => setMode("color")}>🎨 색칠</button>
          <button type="button" className={tool(mode === "erase")} data-track="studio_custom_mode_erase"
                  onClick={() => setMode("erase")}>🧽 지우개</button>
          <button type="button" className={tool(mode === "sticker")} data-track="studio_custom_mode_sticker"
                  onClick={() => setMode("sticker")}>⭐ 스티커</button>
          <button type="button" className={tool(mode === "text")} data-track="studio_custom_mode_text"
                  onClick={() => setMode("text")}>✏️ 글자</button>
          <label className={tool(false) + " cursor-pointer"} data-track="studio_custom_logo">
            🖼️ 사진<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogoFile}/>
          </label>
        </div>

        {/* 모드별 재료 선택 줄 */}
        {(mode === "color" || mode === "erase" || mode === "text") && (
          <div className="flex flex-wrap items-center gap-2">
            {PALETTE.map((c) => (
              <button key={c} type="button" aria-label={`색 ${c}`}
                      onClick={() => { setColor(c); if (mode === "erase") setMode("color"); }}
                      className="h-9 w-9 rounded-full border-2 border-white shadow"
                      style={{ background: c, outline: color === c ? "3px solid #0f172a" : "none", outlineOffset: 1 }} />
            ))}
          </div>
        )}
        {mode === "sticker" && (
          <div className="flex flex-wrap items-center gap-1.5">
            {STICKERS.map((s) => (
              <button key={s} type="button" aria-label={`스티커 ${s}`}
                      onClick={() => setSticker(s)}
                      className={`h-11 w-11 rounded-xl text-2xl leading-none transition-transform ${
                        sticker === s ? "bg-blue-50 ring-2 ring-[var(--pe-blue,#1a73e8)] scale-110" : "hover:bg-slate-50"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
        {mode === "text" && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <input value={text} onChange={(e) => setText(e.target.value)}
                   placeholder="넣을 글자를 여기에 써요"
                   className="rounded-xl border-2 border-slate-200 px-3 py-2 w-56 text-base" />
            <label className="flex items-center gap-1.5 text-slate-600">
              글자 크기 <input type="range" min={4} max={20} value={textSize}
                          onChange={(e) => setTextSize(Number(e.target.value))} /> {textSize}mm
            </label>
          </div>
        )}

        {/* 지금 할 일 안내 — 아동용 단계 문구 */}
        <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900 font-medium"
           style={{ wordBreak: "keep-all" }}>
          👉 {mode ? HINTS[mode] : "위에서 도구를 골라요"} · 붙인 것은 손으로 끌어 옮기고,
          두 번 콕콕! 누르면 사라져요.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" data-track={`studio_custom_print:${trackId}`}
                  onClick={() => window.print()}
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-base text-white font-bold hover:opacity-90">
            🖨️ 인쇄하기
          </button>
          <label className="flex items-center gap-1.5 text-slate-600">
            인쇄 크기 <input type="range" min={50} max={100} value={scale} data-track="studio_custom_scale"
                        onChange={(e) => { const v = Number(e.target.value); setScale(v); applyScale(v); persist(); }} />
            {scale}%
          </label>
          <button type="button" onClick={resetAll} data-track="studio_custom_reset"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50">
            처음부터
          </button>
          <span className="text-xs text-slate-400">
            {savedAt ? `자동 저장됨 ${savedAt} (이 브라우저)` : "바꾸면 저절로 저장돼요"}
          </span>
        </div>
      </div>

      {/* ── 시트 캔버스 ── */}
      {error && <p className="py-12 text-center text-red-600">{error}</p>}
      {!ready && !error && <p className="py-12 text-center text-slate-500">도면 불러오는 중…</p>}
      <div
        ref={hostRef}
        className="pc-sheets mt-6 space-y-8"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
      />

      {/* 화면·인쇄 스타일: 시트=A4 실측, 인쇄 시 도구막대/헤더 숨김 */}
      <style>{`
        .pc-sheets .pc-sheet { box-shadow: 0 2px 14px rgba(15,23,42,.12); border-radius: 8px; overflow: hidden; }
        .pc-sheets svg.pc-sheet-svg { display: block; width: 100%; height: auto; touch-action: pan-y; }
        @media print {
          header, footer, nav, .pc-toolbar, .pc-hide-print { display: none !important; }
          .pc-sheets { margin: 0 !important; }
          .pc-sheets .pc-sheet { box-shadow: none; border-radius: 0; page-break-after: always; }
          .pc-sheets svg.pc-sheet-svg { width: 210mm; height: 297mm; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
}
