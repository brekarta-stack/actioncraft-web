/**
 * POST /api/studio/upload — 내 3D 모델을 전개 큐에 넣는다 (웹 M3).
 * 폼: file(≤4MB, stl/obj/ply/glb/gltf) · detail(1~3).
 * 같은 (파일 해시, 난이도, 용지) 는 캐시된 결과를 즉시 재사용한다.
 * 남용 방지: IP(해시)당 하루 10건. 개인 파일이므로 버킷은 비공개, 보관 7일.
 */

import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  MAX_UPLOAD_BYTES,
  RATE_LIMIT_PER_DAY,
  sanitizeUploadName,
} from "@/lib/studio-work-shared.mjs";
import {
  cacheKey,
  ensureBucket,
  getJson,
  ipHash,
  putJson,
  store,
  type StudioJob,
} from "@/lib/studio-work";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const file = form.get("file");
  const detail = Math.min(3, Math.max(1, Number(form.get("detail")) || 2));
  const paper = "A4"; // M3 베타는 A4 고정 (카탈로그와 동일)

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "파일이 4MB 를 넘습니다. 면 수를 줄여 내보낸 뒤 다시 올려 주세요." },
      { status: 413 },
    );
  }
  const safeName = sanitizeUploadName(file.name || "");
  if (!safeName) {
    return NextResponse.json(
      { error: "지원하지 않는 형식입니다. STL·OBJ·PLY·GLB·GLTF 만 받아요." },
      { status: 415 },
    );
  }

  await ensureBucket();

  // IP(해시)당 일일 한도 — 베타 남용 방지. 경쟁 조건은 베타 규모에서 무시 가능.
  const ip = ipHash(request);
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const ratePath = `ratelimit/${day}/${ip}.json`;
  const rate = (await getJson<{ n: number }>(ratePath)) ?? { n: 0 };
  if (rate.n >= RATE_LIMIT_PER_DAY) {
    return NextResponse.json(
      { error: `오늘은 여기까지예요. 하루 ${RATE_LIMIT_PER_DAY}건까지 올릴 수 있습니다.` },
      { status: 429 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");

  // 동일 입력 캐시 — 이미 성공한 결과가 있으면 그 잡을 그대로 돌려준다.
  const cached = await getJson<{ job: string }>(cacheKey(hash, detail, paper));
  if (cached?.job) {
    const status = await getJson<{ status: string }>(`results/${cached.job}/status.json`);
    if (status?.status === "done") {
      return NextResponse.json({ job: cached.job, cached: true });
    }
  }

  const id = randomUUID();
  const up = await store().upload(`uploads/${id}/${safeName}`, bytes, {
    contentType: "application/octet-stream",
    upsert: false,
  });
  if (up.error) {
    return NextResponse.json({ error: "업로드 저장에 실패했습니다." }, { status: 500 });
  }
  const job: StudioJob = {
    id,
    file: safeName,
    detail,
    paper,
    size: bytes.length,
    hash,
    ip,
    created_at: new Date().toISOString(),
  };
  await putJson(`queue/${id}.json`, job);
  await putJson(ratePath, { n: rate.n + 1 });

  return NextResponse.json({ job: id });
}
