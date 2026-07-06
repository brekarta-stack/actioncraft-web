/**
 * GET /api/studio/job/[id]/file/[name] — 업로드 전개 결과 파일 프록시.
 * 버킷이 비공개이므로 브라우저는 이 라우트로만 받는다. 파일명은 화이트리스트
 * 정규식으로만 해석(경로 조작 불가). print.pdf 는 카탈로그와 같은 유료
 * 게이트(STUDIO_PAID_GATE) 를 따른다. 개인 산출물 — 캐시는 비공개, 색인 금지.
 */

import { NextResponse } from "next/server";
import { paidGateResponse } from "@/lib/studio-server";
import {
  JOB_ID_RE,
  RESULT_NAME_RE,
  contentTypeFor,
} from "@/lib/studio-work-shared.mjs";
import { ensureBucket, store } from "@/lib/studio-work";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; name: string }> },
) {
  const { id, name } = await params;
  if (!JOB_ID_RE.test(id) || !RESULT_NAME_RE.test(name)) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (name === "print.pdf") {
    const gate = paidGateResponse();
    if (gate) return gate;
  }
  await ensureBucket();

  const { data, error } = await store().download(`results/${id}/${name}`);
  if (error || !data) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 404 });
  }
  const headers: Record<string, string> = {
    "Content-Type": contentTypeFor(name),
    "Cache-Control": "private, max-age=3600",
    "X-Robots-Tag": "noindex",
  };
  if (name === "print.pdf") {
    headers["Content-Disposition"] =
      `attachment; filename*=UTF-8''${encodeURIComponent("내 모델 종이모형 (papercraft.kr).pdf")}`;
  }
  return new NextResponse(await data.arrayBuffer(), { headers });
}
