/**
 * GET /api/studio/sheet/[key]/[n] — 꾸미기 에디터용 클린 시트 SVG (워터마크 없음).
 * 유료 자산이라 비공개 폴더에서만 서빙 (베타=무료, STUDIO_PAID_GATE=1 → 402).
 */

import { NextResponse } from "next/server";
import { paidGateResponse, resolveStudioItem, servePrivateFile } from "@/lib/studio-server";
import { isExposed } from "@/lib/studio-review";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string; n: string }> },
) {
  const { key, n } = await params;
  const item = resolveStudioItem(key);
  if (!item) {
    return NextResponse.json({ error: "존재하지 않는 도안입니다." }, { status: 404 });
  }
  if (!(await isExposed(item.skey))) {               // 검수 큐레이션 게이트(반려 비노출)
    return NextResponse.json({ error: "존재하지 않는 도안입니다." }, { status: 404 });
  }
  const num = Number.parseInt(n, 10);
  if (!Number.isInteger(num) || num < 1 || num > item.svg_sheets) {
    return NextResponse.json({ error: "존재하지 않는 시트입니다." }, { status: 404 });
  }
  const gate = paidGateResponse();
  if (gate) return gate;
  return servePrivateFile(item, `sheet_p${num}.svg`, "image/svg+xml; charset=utf-8");
}
