/**
 * GET /api/studio/net/[key] — 도면 JSON (면 좌표·시트 배치·여백).
 * 꾸미기 에디터의 색칠 오버레이 입력. 클린 시트와 같은 비공개 정책.
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
  return servePrivateFile(item, "net.json", "application/json; charset=utf-8");
}
