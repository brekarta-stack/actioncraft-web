"use client";

/**
 * 업로드 결과 꾸미기 래퍼 — ?job= 을 읽어 잡이 done 인지 확인한 뒤,
 * 결과 파일 URL(클린 시트·net.json)을 공용 에디터에 주입한다.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StudioCustomizer from "./StudioCustomizer";

const JOB_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface JobDone {
  status: string;
  meta?: { name_ko?: string; svg_sheets?: number };
  error?: string;
}

export default function UploadCustomClient() {
  const params = useSearchParams();
  const job = params.get("job") ?? "";
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "error"; msg: string }
    | { kind: "ready"; name: string; sheets: number }
  >({ kind: "loading" });

  useEffect(() => {
    if (!JOB_ID_RE.test(job)) {
      setState({ kind: "error", msg: "잘못된 주소예요. 업로드 결과 화면에서 다시 들어와 주세요." });
      return;
    }
    (async () => {
      try {
        const r = await fetch(`/api/studio/job/${job}`);
        const j: JobDone = await r.json();
        if (r.ok && j.status === "done") {
          setState({
            kind: "ready",
            name: j.meta?.name_ko ?? "내 모델",
            sheets: Math.max(1, Number(j.meta?.svg_sheets) || 1),
          });
        } else {
          setState({
            kind: "error",
            msg: j.status === "failed"
              ? "전개에 실패한 모델이에요. 다시 올려 주세요."
              : "아직 전개가 끝나지 않았거나 결과가 만료(7일)되었어요.",
          });
        }
      } catch {
        setState({ kind: "error", msg: "네트워크 오류로 결과를 확인하지 못했습니다." });
      }
    })();
  }, [job]);

  if (state.kind === "loading") {
    return <p className="text-sm text-slate-500">결과를 확인하는 중…</p>;
  }
  if (state.kind === "error") {
    return (
      <div>
        <p className="text-sm text-slate-600" style={{ wordBreak: "keep-all" }}>{state.msg}</p>
        <Link href="/studio/upload" className="mt-3 inline-block text-sm text-[var(--pe-blue,#1a73e8)] underline underline-offset-2">
          ← 내 3D 모델 전개로 돌아가기
        </Link>
      </div>
    );
  }

  const base = `/api/studio/job/${job}/file`;
  return (
    <>
      <nav className="pc-hide-print mb-4 text-sm text-slate-500 flex items-center gap-2">
        <Link href="/studio/upload" className="hover:underline" data-track="studio_upload_custom_back">
          ← 내 3D 모델 전개
        </Link>
        <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5">
          꾸미기 베타
        </span>
      </nav>
      <h1 className="pc-hide-print text-2xl font-bold mb-4" style={{ wordBreak: "keep-all" }}>
        {state.name} 꾸미기
      </h1>
      <StudioCustomizer
        name={state.name}
        sheets={state.sheets}
        netUrl={`${base}/net.json`}
        sheetUrlTemplate={`${base}/sheet_p{n}.svg`}
        storageKey={`studio_custom_job_${job}`}
        trackId="upload"
      />
    </>
  );
}
