/**
 * GET /api/studio/pdf/[key] — 인쇄용 PDF 서빙 (비공개 폴더 → 스트림).
 *
 * 정책(웹 로드맵 §5-1): PDF 는 유료 대상이라 public/ 에 두지 않는다.
 *  · 베타(기본): 누구나 다운로드 — 수요 KPI 관찰용. 다운로드 클릭은 클라이언트
 *    계측(data-track="studio_pdf:<key>")이 기록한다.
 *  · 유료 전환: 환경변수 STUDIO_PAID_GATE=1 이면 402 로 잠금(결제 연동 시
 *    이 라우트에 이용권 검증을 붙인다 — 파일 위치·URL 은 그대로).
 *
 * 보안: key 는 index.json 화이트리스트(getStudioItem)로만 해석 — 경로 조작 불가.
 */

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStudioItem, STUDIO_VER } from "@/lib/studio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const item = getStudioItem(key);
  if (!item) {
    return NextResponse.json({ error: "존재하지 않는 도안입니다." }, { status: 404 });
  }

  if (process.env.STUDIO_PAID_GATE === "1") {
    return NextResponse.json(
      { error: "유료 도안입니다. 결제 기능 준비 중입니다." },
      { status: 402 },
    );
  }

  const file = path.join(
    process.cwd(), "content-private", "studio", STUDIO_VER, item.skey, "print.pdf",
  );
  let buf: Buffer;
  try {
    buf = await fs.readFile(file);
  } catch {
    console.error(`[studio/pdf] missing file: ${file}`);
    return NextResponse.json({ error: "도안 파일을 찾지 못했습니다." }, { status: 500 });
  }

  const filename = encodeURIComponent(`${item.name_ko} 종이모형 (papercraft.kr).pdf`);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buf.byteLength),
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
