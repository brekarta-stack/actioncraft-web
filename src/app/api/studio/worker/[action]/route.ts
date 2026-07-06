/**
 * POST /api/studio/worker/[action] — mini 전개 워커 전용 API (claim·uploadurl·complete).
 *
 * 워커→서버 아웃바운드 폴링만 쓰는 이유(로드맵 §5-3): 가정망(mini)에 포트를
 * 열지 않기 위해서다. 인증은 X-Studio-Worker 시크릿(타이밍 안전 비교).
 * 파일 본문은 이 라우트를 지나지 않는다 — 다운로드/업로드 모두 서명 URL 로
 * 워커↔스토리지 직결(요청 4.5MB 한도 우회).
 *
 *   claim     대기 잡 하나를 running 으로 옮기고 원본 서명 다운로드 URL 반환.
 *             부수 작업: 15분 넘게 물려 있는 running 재큐잉, {prune:true} 면
 *             7일 지난 결과·이틀 지난 rate 카운터 청소.
 *   uploadurl 결과 파일명(화이트리스트)별 서명 업로드 URL 발급.
 *   complete  status.json 기록, 성공 시 캐시 포인터 저장, 원본·running 정리.
 */

import { NextResponse } from "next/server";
import { RESULT_NAME_RE, JOB_ID_RE, RESULT_TTL_DAYS } from "@/lib/studio-work-shared.mjs";
import {
  cacheKey,
  ensureBucket,
  getJson,
  listQueue,
  putJson,
  store,
  workerSecretOk,
  type StudioJob,
} from "@/lib/studio-work";

export const runtime = "nodejs";
export const maxDuration = 60;

const STALE_RUNNING_MS = 15 * 60 * 1000;

async function reclaimStale() {
  const { data } = await store().list("running", { limit: 20 });
  for (const e of data ?? []) {
    if (!e.name.endsWith(".json") || !e.created_at) continue;
    if (Date.now() - new Date(e.created_at).getTime() < STALE_RUNNING_MS) continue;
    const job = await getJson<StudioJob>(`running/${e.name}`);
    if (job) {
      delete job.claimed_at;
      await putJson(`queue/${job.id}.json`, job);
    }
    await store().remove([`running/${e.name}`]);
  }
}

async function removeFolder(prefix: string) {
  const { data } = await store().list(prefix, { limit: 100 });
  const files = (data ?? []).filter((e) => e.id).map((e) => `${prefix}/${e.name}`);
  if (files.length) await store().remove(files);
}

async function prune() {
  // 결과 7일 보관 — status.json 의 finished_at 기준으로 폴더째 삭제.
  const cutoff = Date.now() - RESULT_TTL_DAYS * 24 * 3600 * 1000;
  const { data: folders } = await store().list("results", { limit: 100 });
  for (const f of folders ?? []) {
    if (f.id) continue; // 폴더만
    const st = await getJson<{ finished_at?: string }>(`results/${f.name}/status.json`);
    if (st?.finished_at && new Date(st.finished_at).getTime() < cutoff) {
      await removeFolder(`results/${f.name}`);
      await removeFolder(`uploads/${f.name}`);
    }
  }
  // rate 카운터는 날짜 폴더명(YYYYMMDD)으로 이틀 지난 것 삭제.
  const today = Number(new Date().toISOString().slice(0, 10).replaceAll("-", ""));
  const { data: days } = await store().list("ratelimit", { limit: 60 });
  for (const d of days ?? []) {
    if (!d.id && /^\d{8}$/.test(d.name) && today - Number(d.name) >= 2) {
      await removeFolder(`ratelimit/${d.name}`);
    }
  }
}

async function claim(body: { prune?: boolean }) {
  await reclaimStale();
  if (body.prune) {
    try {
      await prune();
    } catch {
      // 청소 실패가 클레임을 막으면 안 된다
    }
  }
  const q = await listQueue(10);
  for (const e of q) {
    const id = e.name.replace(/\.json$/, "");
    const job = await getJson<StudioJob>(`queue/${e.name}`);
    if (!job) continue;
    const { data: signed, error } = await store().createSignedUrl(
      `uploads/${id}/${job.file}`,
      600,
    );
    if (error || !signed) {
      // 원본이 사라진 유령 잡 — 큐에서 치우고 실패 기록
      await putJson(`results/${id}/status.json`, {
        status: "failed",
        error: "업로드 원본이 유실되었습니다. 다시 올려 주세요.",
        finished_at: new Date().toISOString(),
      });
      await store().remove([`queue/${e.name}`]);
      continue;
    }
    job.claimed_at = new Date().toISOString();
    await putJson(`running/${id}.json`, job);
    await store().remove([`queue/${e.name}`]);
    return NextResponse.json({ job, download: signed.signedUrl });
  }
  return new NextResponse(null, { status: 204 });
}

async function uploadurl(body: { job?: string; names?: string[] }) {
  const id = body.job ?? "";
  const names = Array.isArray(body.names) ? body.names : [];
  if (!JOB_ID_RE.test(id) || names.length === 0 || names.length > 40) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (!names.every((n) => typeof n === "string" && RESULT_NAME_RE.test(n))) {
    return NextResponse.json({ error: "허용되지 않은 파일명" }, { status: 400 });
  }
  const urls: Record<string, string> = {};
  for (const n of names) {
    const { data, error } = await store().createSignedUploadUrl(`results/${id}/${n}`, {
      upsert: true,
    });
    if (error || !data) {
      return NextResponse.json({ error: `서명 실패: ${n}` }, { status: 500 });
    }
    urls[n] = data.signedUrl;
  }
  return NextResponse.json({ urls });
}

async function complete(body: {
  job?: string;
  ok?: boolean;
  meta?: Record<string, unknown>;
  error?: string;
}) {
  const id = body.job ?? "";
  if (!JOB_ID_RE.test(id)) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const running = await getJson<StudioJob>(`running/${id}.json`);
  await putJson(`results/${id}/status.json`, {
    status: body.ok ? "done" : "failed",
    ...(body.ok ? { meta: body.meta ?? {} } : { error: String(body.error ?? "알 수 없는 오류").slice(0, 500) }),
    finished_at: new Date().toISOString(),
  });
  if (body.ok && running) {
    await putJson(cacheKey(running.hash, running.detail, running.paper), { job: id });
  }
  if (running) {
    await store().remove([`running/${id}.json`, `uploads/${id}/${running.file}`]);
  }
  return NextResponse.json({ ok: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  if (!workerSecretOk(request.headers.get("x-studio-worker"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { action } = await params;
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // 빈 본문 허용
  }
  await ensureBucket();
  if (action === "claim") return claim(body);
  if (action === "uploadurl") return uploadurl(body);
  if (action === "complete") return complete(body);
  return NextResponse.json({ error: "unknown action" }, { status: 404 });
}
