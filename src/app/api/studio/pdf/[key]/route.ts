/**
 * GET /api/studio/pdf/[key] — 인쇄용 PDF 서빙 (비공개 폴더 → 스트림).
 *
 * 정책(웹 로드맵 §5-1): PDF 는 유료 대상이라 public/ 에 두지 않는다.
 *  · 베타(기본): 누구나 다운로드 — 수요 KPI 관찰용. 다운로드 클릭은 클라이언트
 *    계측(data-track="studio_pdf:<key>")이 기록한다.
 *  · 유료 전환: STUDIO_PAID_GATE=1 이면 402 (결제 연동 시 이용권 검증 추가).
 * 보안: key 는 index.json 화이트리스트로만 해석 — 경로 조작 불가.
 */

import { NextResponse } from "next/server";
import { paidGateResponse, resolveStudioItem, servePrivateFile } from "@/lib/studio-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const item = resolveStudioItem(key);
  if (!item) {
    return NextResponse.json({ error: "존재하지 않는 도안입니다." }, { status: 404 });
  }
  const gate = paidGateResponse();
  if (gate) return gate;

  const filename = encodeURIComponent(`${item.name_ko} 종이모형 (papercraft.kr).pdf`);
  return servePrivateFile(item, "print.pdf", "application/pdf",
    `attachment; filename*=UTF-8''${filename}`);
}
