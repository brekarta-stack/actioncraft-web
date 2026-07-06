"use client";

/**
 * 내 3D 모델 업로드 → 전개 진행 → 결과(3D·도면·PDF) — 웹 M3 클라이언트.
 * 서버는 큐에 넣기만 하고 실제 전개는 워커가 하므로, 여기서는 3초 간격으로
 * 잡 상태를 폴링해 대기 순번 → 전개 중 → 완료/실패를 그대로 보여 준다.
 * 마지막 잡 ID 는 localStorage 에 남겨 새로고침 후에도 결과를 다시 연다.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import StudioSheets from "./StudioSheets";
import StudioViewer from "./StudioViewer";

const LAST_KEY = "studio_upload_last";
const MAX_MB = 4;

interface DoneMeta {
  name_ko?: string;
  pieces?: number;
  pages?: number;
  finished_mm?: number;
  stars?: number;
  est_minutes?: number;
  svg_sheets?: number;
  buildable?: boolean;
}

type Phase =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "queued"; job: string; position: number }
  | { kind: "running"; job: string }
  | { kind: "done"; job: string; meta: DoneMeta }
  | { kind: "failed"; job: string; error: string }
  | { kind: "error"; error: string };

export default function StudioUpload() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [detail, setDetail] = useState(2);
  const [lastJob, setLastJob] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setLastJob(localStorage.getItem(LAST_KEY));
    } catch {}
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const watch = useCallback((job: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const tick = async () => {
      try {
        const r = await fetch(`/api/studio/job/${job}`);
        if (r.status === 404) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPhase({ kind: "error", error: "결과가 만료되었거나 없는 작업입니다." });
          return;
        }
        const s = await r.json();
        if (s.status === "done") {
          if (pollRef.current) clearInterval(pollRef.current);
          setPhase({ kind: "done", job, meta: s.meta ?? {} });
        } else if (s.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setPhase({ kind: "failed", job, error: s.error ?? "알 수 없는 오류" });
        } else if (s.status === "running") {
          setPhase({ kind: "running", job });
        } else if (s.status === "queued") {
          setPhase({ kind: "queued", job, position: s.position ?? 1 });
        }
      } catch {
        // 일시적 네트워크 오류는 다음 폴링에서 회복
      }
    };
    void tick();
    pollRef.current = setInterval(tick, 3000);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setPhase({
        kind: "error",
        error: `파일이 ${MAX_MB}MB 를 넘습니다. 모델링 도구에서 면 수를 줄여 다시 내보내 주세요.`,
      });
      return;
    }
    setPhase({ kind: "uploading" });
    const fd = new FormData();
    fd.set("file", f);
    fd.set("detail", String(detail));
    try {
      const r = await fetch("/api/studio/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) {
        setPhase({ kind: "error", error: j.error ?? `업로드 실패 (HTTP ${r.status})` });
        return;
      }
      try {
        localStorage.setItem(LAST_KEY, j.job);
        setLastJob(j.job);
      } catch {}
      watch(j.job);
    } catch {
      setPhase({ kind: "error", error: "네트워크 오류로 업로드하지 못했습니다." });
    }
  }

  const busy = phase.kind === "uploading" || phase.kind === "queued" || phase.kind === "running";

  return (
    <div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">
              3D 모델 파일
            </span>
            <input
              ref={fileRef}
              type="file"
              required
              accept=".stl,.obj,.ply,.glb,.gltf"
              disabled={busy}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--pe-blue,#1a73e8)] hover:file:bg-blue-100"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-slate-700 mb-1.5">난이도</span>
            <select
              value={detail}
              onChange={(e) => setDetail(Number(e.target.value))}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value={1}>쉬움 — 조각 적게</option>
              <option value={2}>보통</option>
              <option value={3}>어려움 — 더 정밀</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy}
            data-track="studio_upload_submit"
            className="rounded-xl bg-[var(--pe-blue,#1a73e8)] px-6 py-2.5 text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            전개하기
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
          STL·OBJ·PLY·GLB·GLTF, 최대 {MAX_MB}MB. 완성 크기 약 150mm, A4 기준으로
          전개됩니다. 올린 파일과 결과는 비공개로 처리되고 7일 뒤 지워집니다.
          하루 10건까지 무료(베타).
        </p>
      </form>

      {phase.kind === "uploading" && <Progress text="파일을 올리는 중…" />}
      {phase.kind === "queued" && (
        <Progress text={`대기 중 — 앞에 ${Math.max(0, phase.position - 1)}건 (순번 ${phase.position})`} />
      )}
      {phase.kind === "running" && <Progress text="전개 중… 복잡한 모델은 몇 분 걸릴 수 있어요." />}

      {(phase.kind === "failed" || phase.kind === "error") && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
             style={{ wordBreak: "keep-all" }}>
          전개하지 못했습니다.
          <div className="mt-1 font-medium">{phase.error}</div>
        </div>
      )}

      {phase.kind === "done" && <UploadResult job={phase.job} meta={phase.meta} />}

      {phase.kind === "idle" && lastJob && (
        <button
          type="button"
          onClick={() => watch(lastJob)}
          data-track="studio_upload_resume"
          className="mt-4 text-sm text-[var(--pe-blue,#1a73e8)] underline underline-offset-2"
        >
          최근에 올린 모델 결과 다시 보기
        </button>
      )}
    </div>
  );
}

function Progress({ text }: { text: string }) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--pe-blue,#1a73e8)]" />
      {text}
    </div>
  );
}

function UploadResult({ job, meta }: { job: string; meta: DoneMeta }) {
  const base = `/api/studio/job/${job}/file`;
  const sheets = Math.max(1, Number(meta.svg_sheets) || 1);
  return (
    <div className="mt-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <StudioViewer src={`${base}/model.glb`} alt={`${meta.name_ko ?? "내 모델"} 3D 미리보기`} />
        <div>
          <h2 className="text-2xl font-bold" style={{ wordBreak: "keep-all" }}>
            {meta.name_ko ?? "내 모델"}
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">조각 수</dt>
              <dd className="font-semibold tabular-nums">{meta.pieces ?? "-"}개</dd>
            </div>
            <div>
              <dt className="text-slate-500">인쇄 장수</dt>
              <dd className="font-semibold tabular-nums">A4 {meta.pages ?? "-"}장</dd>
            </div>
            <div>
              <dt className="text-slate-500">완성 크기</dt>
              <dd className="font-semibold tabular-nums">
                약 {Math.round(Number(meta.finished_mm) || 0)}mm
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">예상 시간</dt>
              <dd className="font-semibold tabular-nums">약 {meta.est_minutes ?? "-"}분</dd>
            </div>
          </dl>
          <div className="mt-6">
            <a
              href={`${base}/print.pdf`}
              data-track="studio_upload_pdf"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--pe-blue,#1a73e8)] px-6 py-3 text-white font-semibold hover:opacity-90"
            >
              인쇄용 PDF 내려받기
            </a>
          </div>
          <p className="mt-2 text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
            실제 크기(100%)로 인쇄하세요. 실선은 자르고, 점선은 접고, 같은
            번호끼리 풀로 붙입니다. 결과는 7일 동안 보관돼요.
          </p>
          {meta.buildable === false && (
            <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800"
               style={{ wordBreak: "keep-all" }}>
            이 모델은 일부 이음에 붙임 날개가 들어가지 않았어요. 그 자리는
            두 조각의 모서리를 맞대어 붙여 주세요. 난이도를 낮추면 줄어들
            수 있어요.
            </p>
          )}
        </div>
      </div>
      <section className="mt-10">
        <h3 className="text-lg font-bold mb-3" style={{ wordBreak: "keep-all" }}>
          도면 미리보기
          <span className="ml-2 align-middle text-xs font-normal text-slate-400">
            워터마크는 내려받은 PDF에는 없습니다
          </span>
        </h3>
        <StudioSheets base={base} sheets={sheets} name={meta.name_ko ?? "내 모델"} />
      </section>
    </div>
  );
}
