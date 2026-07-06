"use client";

/**
 * 웹 꾸미기 에디터 (M2 트랙B, 아동용 UX) — 클린 시트 SVG 위에 색칠·글자·
 * 스티커·눈·사진을 얹어 브라우저에서 실측(A4) 인쇄한다. 서버 계산 없음.
 *
 * 동작 원리:
 *  · /api/studio/sheet/<key>/<n> 의 클린 SVG(mm viewBox)를 인라인 주입
 *  · /api/studio/net/<key> 의 도면 JSON(면 좌표·시트 배치·여백)으로 각 시트에
 *    부품별 색칠 오버레이 <g data-part>(반투명 polygon)를 같은 mm 좌표로 그림
 *  · 글자/스티커/눈/사진 = SVG 데코(하나의 decos 배열). 넣을 곳을 먼저 콕!
 *    누르면(글자는 그 자리에 작은 입력창) 배치, 끌어서 이동, 콕 눌러 골라 🗑 삭제
 *  · 되돌리기/다시하기 = 상태 스냅샷 히스토리
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

type Deco =
  | { id: string; kind: "text"; sheet: number; x: number; y: number; size: number; str: string; color: string }
  | { id: string; kind: "image"; sheet: number; x: number; y: number; w: number; h: number; data: string };

interface SavedState {
  fills: Record<string, string>;
  decos: Deco[];
  scale: number;
}
// 하위호환: 예전 저장본은 texts/images 분리 배열이었다.
interface LegacyState {
  fills?: Record<string, string>;
  texts?: Array<{ sheet: number; x: number; y: number; size: number; str: string; color: string }>;
  images?: Array<{ sheet: number; x: number; y: number; w: number; h: number; data: string }>;
  scale?: number;
}

const SVGNS = "http://www.w3.org/2000/svg";
const PALETTE = ["#e5484d", "#f76b15", "#ffc53d", "#46a758", "#00a2c7",
                 "#3e63dd", "#8e4ec6", "#e93d82", "#8d6e63", "#607d8b"];
// 이모지 스티커 — 텍스트 글리프 데코로 배치
const EMOJI_STICKERS = ["⭐", "❤️", "😊", "🌈", "🌸", "🦋", "🚀", "👑", "⚡", "🍀",
                        "🎵", "🐾", "🌟", "🎈", "🍭", "🐶", "🌞", "🍎"];
// 눈 스티커 — 좌/우/가운데를 보는 googly eye(흰자+검은자 오프셋)를 SVG 이미지 데코로
const EYE_STICKERS: Array<{ dir: "left" | "right" | "center"; label: string }> = [
  { dir: "left", label: "왼쪽 보는 눈" },
  { dir: "center", label: "가운데 눈" },
  { dir: "right", label: "오른쪽 보는 눈" },
];

const HINTS: Record<string, string> = {
  color: "색을 고르고, 도면 조각을 콕! 누르면 색칠돼요",
  erase: "지우고 싶은 조각을 콕! 누르면 색이 지워져요",
  text: "글자를 넣고 싶은 곳을 콕! 누르면 그 자리에 쓸 수 있어요",
  sticker: "스티커를 고르고, 붙일 곳을 콕! 눌러요",
};

let decoSeq = 0;
const nextId = () => `d${Date.now().toString(36)}_${(decoSeq++).toString(36)}`;

/** 좌/우/가운데를 보는 만화 눈 — data URI SVG (drag·삭제·저장은 이미지 데코와 동일) */
function eyeDataUri(dir: "left" | "right" | "center"): string {
  const off = dir === "left" ? -6 : dir === "right" ? 6 : 0;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'>` +
    `<circle cx='20' cy='20' r='18' fill='#ffffff' stroke='#222' stroke-width='2.5'/>` +
    `<circle cx='${20 + off}' cy='23' r='8.5' fill='#222'/>` +
    `<circle cx='${17 + off}' cy='20' r='2.6' fill='#fff'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const clone = (s: SavedState): SavedState => ({
  fills: { ...s.fills },
  decos: s.decos.map((d) => ({ ...d })),
  scale: s.scale,
});

export default function StudioCustomizer({ name, sheets, netUrl, sheetUrlTemplate, storageKey, trackId }: {
  name: string;
  sheets: number;
  netUrl: string;
  sheetUrlTemplate: string;
  storageKey: string;
  trackId: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SavedState>({ fills: {}, decos: [], scale: 100 });
  const undoRef = useRef<SavedState[]>([]);
  const redoRef = useRef<SavedState[]>([]);
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"color" | "erase" | "text" | "sticker" | null>("color");
  const [color, setColor] = useState(PALETTE[0]);
  // 스티커 선택: 이모지 글자 또는 "eye:left|right|center"
  const [sticker, setSticker] = useState<string>(EMOJI_STICKERS[0]);
  const [textSize, setTextSize] = useState(8);
  const [scale, setScale] = useState(100);
  const [savedAt, setSavedAt] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  // 글자 입력 팝오버(클릭한 자리) · 선택된 데코의 🗑 버튼
  const [pending, setPending] = useState<{ sheet: number; x: number; y: number; left: number; top: number } | null>(null);
  const [pendingText, setPendingText] = useState("");
  const [selected, setSelected] = useState<{ id: string; left: number; top: number } | null>(null);

  /* mm 좌표 변환: 클릭 지점 → 해당 시트 SVG 의 사용자 좌표(mm) */
  const toMM = (svg: SVGSVGElement, clientX: number, clientY: number) => {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const svgOf = (sheet: number) =>
    hostRef.current?.querySelectorAll<SVGSVGElement>("svg.pc-sheet-svg")[sheet] ?? null;

  const persist = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateRef.current));
      setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour12: false }));
    } catch { /* 저장 실패는 치명적이지 않음 */ }
  }, [storageKey]);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(undoRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }, []);

  /** 변경 직전 상태를 히스토리에 적재(되돌리기 기준점). redo 는 새 동작이 생기면 무효. */
  const pushHistory = useCallback(() => {
    undoRef.current.push(clone(stateRef.current));
    if (undoRef.current.length > 60) undoRef.current.shift();
    redoRef.current = [];
    syncHistoryFlags();
  }, [syncHistoryFlags]);

  /* ── 저수준 렌더러 (상태 변경 없음) ── */
  const paintFill = (part: string, fill: string | null) => {
    hostRef.current?.querySelectorAll(`g.pc-overlay [data-part="${part}"] polygon`).forEach((p) => {
      if (fill) {
        p.setAttribute("fill", fill);
        p.setAttribute("fill-opacity", "0.5");
      } else {
        p.setAttribute("fill", "transparent");
        p.removeAttribute("fill-opacity");
      }
    });
  };

  const renderDeco = useCallback((d: Deco) => {
    const svg = svgOf(d.sheet);
    const net = svg?.querySelector("g.pc-net");
    if (!net) return;
    let el: SVGGraphicsElement;
    if (d.kind === "text") {
      const t = document.createElementNS(SVGNS, "text");
      t.textContent = d.str;
      t.setAttribute("x", String(d.x));
      t.setAttribute("y", String(d.y));
      t.setAttribute("font-size", String(d.size));
      t.setAttribute("fill", d.color);
      t.setAttribute("font-family", "sans-serif");
      t.setAttribute("font-weight", "700");
      el = t;
    } else {
      const im = document.createElementNS(SVGNS, "image");
      im.setAttribute("href", d.data);
      im.setAttribute("x", String(d.x));
      im.setAttribute("y", String(d.y));
      im.setAttribute("width", String(d.w));
      im.setAttribute("height", String(d.h));
      el = im;
    }
    el.setAttribute("class", "pc-deco");
    el.setAttribute("data-id", d.id);
    el.style.cursor = "move";
    net.appendChild(el);
  }, []);

  const applyScale = useCallback((pct: number) => {
    hostRef.current?.querySelectorAll<SVGSVGElement>("svg.pc-sheet-svg").forEach((svg) => {
      const g = svg.querySelector<SVGGElement>("g.pc-net");
      if (!g) return;
      const vb = svg.viewBox.baseVal;
      const cx = vb.width / 2, cy = vb.height / 2, s = pct / 100;
      g.setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
    });
  }, []);

  /** 상태 하나로부터 화면 전체를 다시 그림 — 복원·되돌리기·다시하기 공용 */
  const rebuild = useCallback((s: SavedState) => {
    stateRef.current = clone(s);
    hostRef.current?.querySelectorAll("g.pc-overlay [data-part] polygon").forEach((p) => {
      p.setAttribute("fill", "transparent");
      p.removeAttribute("fill-opacity");
    });
    for (const [part, fill] of Object.entries(s.fills)) paintFill(part, fill);
    hostRef.current?.querySelectorAll(".pc-deco").forEach((el) => el.remove());
    for (const d of s.decos) renderDeco(d);
    applyScale(s.scale);
    setScale(s.scale);
  }, [renderDeco, applyScale]);

  /* ── 데코 추가/삭제 (히스토리 기록) ── */
  const addDeco = useCallback((d: Deco) => {
    pushHistory();
    stateRef.current.decos.push(d);
    renderDeco(d);
    persist();
  }, [pushHistory, renderDeco, persist]);

  const removeDeco = useCallback((id: string) => {
    pushHistory();
    stateRef.current.decos = stateRef.current.decos.filter((d) => d.id !== id);
    hostRef.current?.querySelector(`.pc-deco[data-id="${id}"]`)?.remove();
    setSelected(null);
    persist();
  }, [pushHistory, persist]);

  const undo = useCallback(() => {
    if (!undoRef.current.length) return;
    redoRef.current.push(clone(stateRef.current));
    rebuild(undoRef.current.pop()!);
    setSelected(null);
    setPending(null);
    persist();
    syncHistoryFlags();
  }, [rebuild, persist, syncHistoryFlags]);

  const redo = useCallback(() => {
    if (!redoRef.current.length) return;
    undoRef.current.push(clone(stateRef.current));
    rebuild(redoRef.current.pop()!);
    setSelected(null);
    setPending(null);
    persist();
    syncHistoryFlags();
  }, [rebuild, persist, syncHistoryFlags]);

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
          [...svg.children].forEach((ch, i) => {
            if (!(i === 0 && ch.tagName === "rect")) wrap.appendChild(ch);   // 0번 페이지 배경은 유지
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

        // 저장분 복원 (신형 decos 우선, 구형 texts/images 자동 이관)
        try {
          const raw = JSON.parse(localStorage.getItem(storageKey) || "null");
          if (raw) {
            let init: SavedState;
            if (Array.isArray(raw.decos)) {
              init = { fills: raw.fills ?? {}, decos: raw.decos, scale: raw.scale ?? 100 };
            } else {
              const lg = raw as LegacyState;
              const decos: Deco[] = [
                ...(lg.texts ?? []).map((t) => ({ id: nextId(), kind: "text" as const, ...t })),
                ...(lg.images ?? []).map((im) => ({ id: nextId(), kind: "image" as const, ...im })),
              ];
              init = { fills: lg.fills ?? {}, decos, scale: lg.scale ?? 100 };
            }
            rebuild(init);
          }
        } catch { /* 복원 실패 시 새로 시작 */ }
        setReady(true);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "불러오기 실패");
      }
    })();
    return () => { alive = false; };
  }, [netUrl, sheetUrlTemplate, sheets, storageKey, rebuild]);

  /* ── 포인터: 색칠 · 글자자리 · 스티커 · 데코 드래그/선택 ── */
  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as Element;
    const svg = target.closest("svg.pc-sheet-svg") as SVGSVGElement | null;

    // 열려 있던 팝오버/선택은 새 조작 시 닫는다
    if (pending) setPending(null);

    // 데코를 눌렀으면: 드래그 준비(움직이면 이동, 안 움직이면 tap→선택/삭제)
    const decoEl = target.closest(".pc-deco") as SVGGraphicsElement | null;
    if (decoEl && svg) {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      const id = decoEl.getAttribute("data-id")!;
      const x = Number(decoEl.getAttribute("x") || 0);
      const y = Number(decoEl.getAttribute("y") || 0);
      dragRef.current = { id, dx: mm.x - x, dy: mm.y - y, moved: false };
      pushHistory();                         // 이동/삭제 전 상태 기록
      e.preventDefault();
      return;
    }

    // 빈 곳을 눌렀으면 선택 해제
    if (selected) { clearSelect(); setSelected(null); }
    if (!svg) return;
    const sheet = Number((svg.closest(".pc-sheet") as HTMLElement)?.dataset.sheet ?? 0);

    // 색칠 / 지우기
    const partG = target.closest("g[data-part]");
    if (partG && (mode === "color" || mode === "erase")) {
      pushHistory();
      const key = partG.getAttribute("data-part")!;
      if (mode === "color") { paintFill(key, color); stateRef.current.fills[key] = color; }
      else { paintFill(key, null); delete stateRef.current.fills[key]; }
      persist();
      return;
    }

    // 글자: 누른 자리에 입력 팝오버를 연다 (클릭 후 입력)
    if (mode === "text") {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      setPendingText("");
      setPending({ sheet, x: mm.x, y: mm.y, left: e.clientX, top: e.clientY });
      return;
    }

    // 스티커/눈 붙이기
    if (mode === "sticker") {
      const mm = toMM(svg, e.clientX, e.clientY);
      if (!mm) return;
      if (sticker.startsWith("eye:")) {
        const dir = sticker.slice(4) as "left" | "right" | "center";
        addDeco({ id: nextId(), kind: "image", sheet, x: mm.x - 7, y: mm.y - 7, w: 14, h: 14, data: eyeDataUri(dir) });
      } else {
        addDeco({ id: nextId(), kind: "text", sheet, x: mm.x, y: mm.y, size: 12, str: sticker, color });
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const el = hostRef.current?.querySelector<SVGGraphicsElement>(`.pc-deco[data-id="${d.id}"]`);
    const svg = el?.closest("svg.pc-sheet-svg") as SVGSVGElement | null;
    if (!el || !svg) return;
    const mm = toMM(svg, e.clientX, e.clientY);
    if (!mm) return;
    d.moved = true;
    const nx = mm.x - d.dx, ny = mm.y - d.dy;
    el.setAttribute("x", String(nx));
    el.setAttribute("y", String(ny));
    const deco = stateRef.current.decos.find((z) => z.id === d.id);
    if (deco) { deco.x = nx; deco.y = ny; }
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved) {
      persist();                             // 이동 확정 (pushHistory 는 down 에서 이미)
    } else {
      // 움직이지 않은 tap = 선택 → 그 자리에 🗑 버튼
      undoRef.current.pop();                 // 선택만 했으니 down 에서 넣은 히스토리 되돌림
      syncHistoryFlags();
      const el = hostRef.current?.querySelector<SVGGraphicsElement>(`.pc-deco[data-id="${d.id}"]`);
      if (el) {
        clearSelect();
        el.classList.add("pc-sel");
        const r = el.getBoundingClientRect();
        setSelected({ id: d.id, left: r.right, top: r.top });
      }
    }
  };

  const clearSelect = () =>
    hostRef.current?.querySelectorAll(".pc-deco.pc-sel").forEach((el) => el.classList.remove("pc-sel"));

  const commitText = () => {
    const str = pendingText.trim();
    if (pending && str) {
      addDeco({ id: nextId(), kind: "text", sheet: pending.sheet, x: pending.x, y: pending.y, size: textSize, str, color });
    }
    setPending(null);
    setPendingText("");
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const el = (e.target as Element).closest(".pc-deco");
    const id = el?.getAttribute("data-id");
    if (id) removeDeco(id);
  };

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      addDeco({ id: nextId(), kind: "image", sheet: 0, x: 80, y: 120, w: 50, h: 50, data: reader.result });
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
          <span className="mx-1 h-7 w-px bg-slate-200" />
          <button type="button" onClick={undo} disabled={!canUndo} data-track="studio_custom_undo"
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-semibold text-slate-700 disabled:opacity-40 hover:border-slate-400"
                  aria-label="되돌리기">↩️ 되돌리기</button>
          <button type="button" onClick={redo} disabled={!canRedo} data-track="studio_custom_redo"
                  className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-semibold text-slate-700 disabled:opacity-40 hover:border-slate-400"
                  aria-label="다시하기">↪️ 다시하기</button>
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
            {EYE_STICKERS.map((e) => (
              <button key={e.dir} type="button" aria-label={e.label} title={e.label}
                      onClick={() => setSticker(`eye:${e.dir}`)}
                      className={`h-11 w-11 rounded-xl p-1 transition-transform ${
                        sticker === `eye:${e.dir}` ? "bg-blue-50 ring-2 ring-[var(--pe-blue,#1a73e8)] scale-110" : "hover:bg-slate-50"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={eyeDataUri(e.dir)} alt={e.label} className="h-full w-full" />
              </button>
            ))}
            <span className="mx-1 h-7 w-px bg-slate-200" />
            {EMOJI_STICKERS.map((s) => (
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
          콕! 눌러 고른 뒤 🗑 를 누르면(또는 두 번 콕콕) 지워져요.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" data-track={`studio_custom_print:${trackId}`}
                  onClick={() => window.print()}
                  className="rounded-2xl bg-emerald-600 px-6 py-2.5 text-base text-white font-bold hover:opacity-90">
            🖨️ 인쇄하기
          </button>
          <label className="flex items-center gap-1.5 text-slate-600">
            인쇄 크기 <input type="range" min={50} max={100} value={scale} data-track="studio_custom_scale"
                        onPointerDown={pushHistory}
                        onChange={(e) => { const v = Number(e.target.value); setScale(v); applyScale(v); stateRef.current.scale = v; persist(); }} />
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

      {/* 글자 입력 팝오버 — 클릭한 자리에 뜬다 */}
      {pending && (
        <div className="pc-hide-print fixed z-30 flex items-center gap-1 rounded-xl border border-slate-300 bg-white p-1.5 shadow-lg"
             style={{ left: Math.min(pending.left, (typeof window !== "undefined" ? window.innerWidth : 400) - 240), top: pending.top + 8 }}>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus value={pendingText} onChange={(e) => setPendingText(e.target.value)}
                 onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") { setPending(null); setPendingText(""); } }}
                 placeholder="여기에 글자를 써요"
                 className="rounded-lg border-2 border-slate-200 px-2.5 py-1.5 text-base w-44" />
          <button type="button" onClick={commitText} data-track="studio_custom_text_ok"
                  className="rounded-lg bg-[var(--pe-blue,#1a73e8)] px-3 py-1.5 text-white text-sm font-semibold">넣기</button>
          <button type="button" onClick={() => { setPending(null); setPendingText(""); }}
                  className="rounded-lg px-2 py-1.5 text-slate-400 text-sm" aria-label="취소">✕</button>
        </div>
      )}

      {/* 선택한 데코의 🗑 삭제 버튼 (왼클릭 삭제) */}
      {selected && (
        <button type="button" data-track="studio_custom_delete"
                onClick={() => removeDeco(selected.id)}
                className="pc-hide-print fixed z-30 -translate-y-full rounded-full bg-red-500 px-3 py-1.5 text-white text-sm font-semibold shadow-lg hover:bg-red-600"
                style={{ left: selected.left + 4, top: selected.top }}>
          🗑 지우기
        </button>
      )}

      {/* 화면·인쇄 스타일: 시트=A4 실측, 인쇄 시 도구막대/헤더 숨김 */}
      <style>{`
        .pc-sheets .pc-sheet { box-shadow: 0 2px 14px rgba(15,23,42,.12); border-radius: 8px; overflow: hidden; }
        .pc-sheets svg.pc-sheet-svg { display: block; width: 100%; height: auto; touch-action: pan-y; }
        .pc-deco.pc-sel { outline: none; filter: drop-shadow(0 0 1.4px #1a73e8) drop-shadow(0 0 1.4px #1a73e8); }
        @media print {
          header, footer, nav, .pc-toolbar, .pc-hide-print { display: none !important; }
          .pc-sheets { margin: 0 !important; }
          .pc-sheets .pc-sheet { box-shadow: none; border-radius: 0; page-break-after: always; }
          .pc-sheets svg.pc-sheet-svg { width: 210mm; height: 297mm; }
          .pc-deco.pc-sel { filter: none; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>
    </div>
  );
}
