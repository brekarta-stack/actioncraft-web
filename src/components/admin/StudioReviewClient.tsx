"use client";

/**
 * 도면 검수 백오피스 (클라이언트).
 *
 *  - 상단: 총 도면 수 · 검수완료 · 미검수 · 진행률 바
 *  - 오늘의 검수: 카탈로그 순서상 첫 미검수 도면 1개를 크게 띄워
 *    썸네일 + 첫 장 도면 미리보기를 보고 [통과]/[반려] 처리 (하루 한 개 페이스)
 *  - 전체 목록: 카테고리·상태·검색 필터 + 도면별 상태 뱃지 + 빠른 처리
 *
 * 검수 처리는 POST /api/admin/studio-review 로 upsert 하고, 성공 시
 * 로컬 상태를 낙관적으로 갱신한다. 무거운 3D(model-viewer) 대신 정적
 * thumb.png / preview_p1.svg 만 사용해 가볍게 렌더한다.
 */

import { useMemo, useState } from "react";

type Status = "pending" | "approved" | "rejected";

export interface ReviewItem {
  skey: string;
  name_ko: string;
  category: string;
  pieces: number;
  pdf_pages: number;
  svg_sheets: number;
  finished_mm: number;
  stars: number;
  status: Status;
  note: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
}

interface Props {
  ver: string;
  items: ReviewItem[];
  categories: string[];
  tableMissing: boolean;
  today: string; // KST YYYY-MM-DD
}

const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  approved: { label: "통과", cls: "text-green-700 bg-green-50 border-green-200", dot: "#16a34a" },
  rejected: { label: "반려", cls: "text-red-700 bg-red-50 border-red-200", dot: "#dc2626" },
  pending:  { label: "미검수", cls: "text-slate-500 bg-slate-50 border-slate-200", dot: "#cbd5e1" },
};

function starLabel(n: number): string {
  const s = Math.max(1, Math.min(5, n || 1));
  return "★".repeat(s) + "☆".repeat(5 - s);
}

function isToday(iso: string | null, today: string): boolean {
  if (!iso) return false;
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }) === today;
}

export default function StudioReviewClient({ ver, items: initial, categories, tableMissing, today }: Props) {
  const [items, setItems] = useState<ReviewItem[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState("");

  // 필터
  const [fCat, setFCat] = useState<string>("all");
  const [fStatus, setFStatus] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");

  const asset = (skey: string, file: string) => `/studio/${ver}/${skey}/${file}`;

  /* ── 통계 ── */
  const stats = useMemo(() => {
    let approved = 0, rejected = 0, reviewedToday = 0;
    for (const it of items) {
      if (it.status === "approved") approved++;
      else if (it.status === "rejected") rejected++;
      if (isToday(it.reviewed_at, today)) reviewedToday++;
    }
    const total = items.length;
    const reviewed = approved + rejected;
    return { total, approved, rejected, reviewed, pending: total - reviewed, percent: total ? Math.round((reviewed / total) * 100) : 0, reviewedToday };
  }, [items, today]);

  /* ── 오늘의 검수 대상 = 첫 미검수 ── */
  const target = useMemo(() => items.find((it) => it.status === "pending") ?? null, [items]);

  /* ── 검수 처리 ── */
  async function review(skey: string, status: Status, noteText?: string) {
    setBusy(skey);
    setErr(null);
    try {
      const res = await fetch("/api/admin/studio-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skey, status, note: noteText ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error ?? "검수 저장에 실패했습니다.");
        return;
      }
      setItems((prev) =>
        prev.map((it) =>
          it.skey === skey
            ? { ...it, status, note: noteText ?? it.note, reviewed_at: data.reviewed_at, reviewer: "나" }
            : it,
        ),
      );
      if (skey === target?.skey) setNote(""); // 다음 대상으로
    } catch {
      setErr("네트워크 오류로 검수를 저장하지 못했습니다.");
    } finally {
      setBusy(null);
    }
  }

  /* ── 목록 필터링 ── */
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((it) => {
      if (fCat !== "all" && it.category !== fCat) return false;
      if (fStatus !== "all" && it.status !== fStatus) return false;
      if (kw && !it.name_ko.toLowerCase().includes(kw) && !it.skey.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [items, fCat, fStatus, q]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* ── 헤더 ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">도면 검수</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          기본 제공 도면을 하루에 한 개씩 검수합니다 · 오늘 {today}
        </p>
      </div>

      {tableMissing && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700">
          <b>studio_reviews 테이블이 아직 없습니다.</b> 검수 결과를 저장하려면{" "}
          <a href="/admin/setup" className="underline font-semibold">DB 셋업</a>에서
          테이블을 먼저 생성하세요. (그전까지 모든 도면은 미검수로 표시됩니다.)
        </div>
      )}
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">{err}</div>
      )}

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label="전체 도면" value={stats.total} sub="기본 제공" tone="slate" />
        <StatCard label="검수 완료" value={stats.reviewed} sub={`통과 ${stats.approved} · 반려 ${stats.rejected}`} tone="green" />
        <StatCard label="미검수" value={stats.pending} sub="남은 도면" tone="amber" />
        <StatCard label="오늘 검수" value={stats.reviewedToday} sub="하루 목표 1개" tone="blue" />
      </div>

      {/* 진행률 바 */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>검수 진행률</span>
          <span className="tabular-nums font-semibold text-slate-700">{stats.percent}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${stats.percent}%`, background: "#1E22B2" }} />
        </div>
      </div>

      {/* ── 오늘의 검수 ── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-bold text-slate-900">오늘의 검수</h2>
          {stats.reviewedToday >= 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              오늘 {stats.reviewedToday}건 처리 · 목표 달성
            </span>
          )}
        </div>

        {target ? (
          <div className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: "#1E22B2" }}>
            <div className="grid md:grid-cols-[220px_1fr] gap-5">
              {/* 3D 썸네일 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden aspect-square flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(target.skey, "thumb.png")} alt={`${target.name_ko} 완성 미리보기`} className="w-full h-full object-contain" />
              </div>

              {/* 정보 + 첫 장 도면 */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#EEF0FF", color: "#1E22B2" }}>
                    {target.category}
                  </span>
                  <span className="text-xs text-amber-500">{starLabel(target.stars)}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{target.name_ko}</h3>
                <p className="text-sm text-slate-500 mb-3">
                  부품 {target.pieces}개 · 도면 {target.svg_sheets}장 · 인쇄 {target.pdf_pages}쪽 · 완성 {Math.round(target.finished_mm)}mm
                </p>

                {/* 첫 장 도면 미리보기 */}
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden mb-3" style={{ maxHeight: 260 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(target.skey, "preview_p1.svg")} alt={`${target.name_ko} 도면 1장`} className="w-full object-contain" style={{ maxHeight: 260 }} />
                </div>

                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <a href={`/studio/${target.skey}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    상세 페이지 열기 ↗
                  </a>
                  <a href={`/studio/${target.skey}/custom`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    꾸미기에서 도면 전체 보기 ↗
                  </a>
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="검수 메모 (반려 사유·수정 요청 등, 선택)"
                  rows={2}
                  className="w-full text-sm rounded-lg border border-slate-200 px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => review(target.skey, "approved", note)}
                    disabled={busy === target.skey}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#16a34a" }}
                  >
                    {busy === target.skey ? "저장 중…" : "✅ 통과"}
                  </button>
                  <button
                    onClick={() => review(target.skey, "rejected", note)}
                    disabled={busy === target.skey}
                    className="flex-1 py-2.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#dc2626" }}
                  >
                    ⛔ 반려
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-bold text-green-800">모든 도면 검수를 마쳤습니다!</p>
            <p className="text-sm text-green-700 mt-1">총 {stats.total}개 · 통과 {stats.approved} · 반려 {stats.rejected}</p>
          </div>
        )}
      </section>

      {/* ── 전체 목록 ── */}
      <section>
        <h2 className="font-bold text-slate-900 mb-3">전체 도면 ({filtered.length}/{stats.total})</h2>

        {/* 필터 */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={fStatus === "all"} onClick={() => setFStatus("all")}>전체 상태</Chip>
            <Chip active={fStatus === "pending"} onClick={() => setFStatus("pending")}>미검수 {stats.pending}</Chip>
            <Chip active={fStatus === "approved"} onClick={() => setFStatus("approved")}>통과 {stats.approved}</Chip>
            <Chip active={fStatus === "rejected"} onClick={() => setFStatus("rejected")}>반려 {stats.rejected}</Chip>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={fCat === "all"} onClick={() => setFCat("all")}>전체 분류</Chip>
            {categories.map((c) => (
              <Chip key={c} active={fCat === c} onClick={() => setFCat(c)}>{c}</Chip>
            ))}
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름·키로 검색"
            className="w-full sm:max-w-xs text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((it) => {
            const m = STATUS_META[it.status];
            return (
              <div key={it.skey} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                <a href={`/studio/${it.skey}`} target="_blank" rel="noopener noreferrer" className="block bg-slate-50 aspect-square relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(it.skey, "thumb.png")} alt={it.name_ko} loading="lazy" className="w-full h-full object-contain" />
                  <span className={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${m.cls}`}>
                    {m.label}
                  </span>
                </a>
                <div className="p-2.5 flex flex-col gap-1.5 flex-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{it.name_ko}</p>
                    <p className="text-[11px] text-slate-400 truncate">{it.category} · {it.pdf_pages}쪽</p>
                  </div>
                  <div className="flex gap-1 mt-auto">
                    <button
                      onClick={() => review(it.skey, "approved")}
                      disabled={busy === it.skey}
                      title="통과"
                      className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${it.status === "approved" ? "bg-green-600 text-white border-green-600" : "border-slate-200 text-slate-500 hover:bg-green-50 hover:text-green-700"}`}
                    >
                      통과
                    </button>
                    <button
                      onClick={() => review(it.skey, "rejected")}
                      disabled={busy === it.skey}
                      title="반려"
                      className={`flex-1 text-[11px] py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${it.status === "rejected" ? "bg-red-600 text-white border-red-600" : "border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-700"}`}
                    >
                      반려
                    </button>
                    {it.status !== "pending" && (
                      <button
                        onClick={() => review(it.skey, "pending")}
                        disabled={busy === it.skey}
                        title="검수 취소(미검수로)"
                        className="text-[11px] px-2 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-12">조건에 맞는 도면이 없습니다.</p>
        )}
      </section>

      {/* ── 반려 도면 수정 파이프라인 안내 (데스크톱 PS2 연동) ── */}
      <section className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <h2 className="font-bold text-slate-800 mb-2">🛠 반려한 도면은 이렇게 고칩니다 (데스크톱 연동)</h2>
        <ol className="list-decimal ml-5 space-y-1" style={{ wordBreak: "keep-all" }}>
          <li>데스크톱 <b>Papercraft Studio 2</b> 앱에서 해당 모델을 열어 수정합니다(씨임·붙이기·배치·꾸미기).</li>
          <li><b>Ctrl+S</b>로 프로젝트(.pcz2)를 저장합니다.</li>
          <li>윈도우 터미널에서:{" "}
            <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]">
              C:\Users\breka\papercraft-studio\.venv\Scripts\python tools\export_override.py &lt;저장한.pcz2&gt;
            </code>
          </li>
          <li>이어서{" "}
            <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]">
              python tools\web_publish.py --all
            </code>{" "}
            → 수정본이 엔진 생성본 대신 배포됩니다(meta에 edited 표시).
          </li>
          <li>여기로 돌아와 해당 도면을 <b>통과</b>로 바꾸면 끝. (수정본 폐기 = {" "}
            <code className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px]">web\overrides\&lt;skey&gt;</code> 폴더 삭제 후 재배포)
          </li>
        </ol>
      </section>
    </div>
  );
}

/* ── 작은 컴포넌트들 ── */
function StatCard({ label, value, sub, tone }: { label: string; value: number; sub: string; tone: "slate" | "green" | "amber" | "blue" }) {
  const bg = { slate: "#F1F5F9", green: "#ECFDF3", amber: "#FEF3C7", blue: "#EEF0FF" }[tone];
  const fg = { slate: "#334155", green: "#15803d", amber: "#b45309", blue: "#1E22B2" }[tone];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mb-2" style={{ background: bg, color: fg }}>
        {label}
      </div>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
        active ? "text-white border-transparent" : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50"
      }`}
      style={active ? { background: "#1E22B2" } : {}}
    >
      {children}
    </button>
  );
}
