/**
 * GET /api/studio/job/[id] — 업로드 전개 잡 상태 (브라우저 폴링용).
 * queued(대기 순번) → running → done(메타·파일 목록) | failed(사유).
 */

import { NextResponse } from "next/server";
import { JOB_ID_RE, resultFileNames } from "@/lib/studio-work-shared.mjs";
import { ensureBucket, getJson, listQueue, type StudioJob } from "@/lib/studio-work";

export const runtime = "nodejs";

interface StatusJson {
  status: "done" | "failed";
  error?: string;
  meta?: { svg_sheets?: number } & Record<string, unknown>;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!JOB_ID_RE.test(id)) {
    return NextResponse.json({ error: "잘못된 잡 ID" }, { status: 400 });
  }
  await ensureBucket();

  const done = await getJson<StatusJson>(`results/${id}/status.json`);
  if (done) {
    if (done.status === "done") {
      return NextResponse.json({
        status: "done",
        meta: done.meta ?? {},
        files: resultFileNames(done.meta?.svg_sheets ?? 0),
      });
    }
    return NextResponse.json({ status: "failed", error: done.error ?? "알 수 없는 오류" });
  }

  const running = await getJson<StudioJob>(`running/${id}.json`);
  if (running) return NextResponse.json({ status: "running" });

  const queued = await getJson<StudioJob>(`queue/${id}.json`);
  if (queued) {
    const q = await listQueue();
    const ahead = q.filter(
      (e) => e.created_at && queued.created_at && e.created_at < queued.created_at,
    ).length;
    return NextResponse.json({ status: "queued", position: ahead + 1 });
  }

  return NextResponse.json({ error: "잡을 찾을 수 없습니다." }, { status: 404 });
}
