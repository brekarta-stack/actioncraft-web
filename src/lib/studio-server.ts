/**
 * /studio 비공개 자산 서빙 공통부 (서버 전용).
 *
 * PDF·클린 시트 SVG·도면 JSON 은 유료 대상이라 public/ 이 아닌 content-private/ 에
 * 있고, 이 헬퍼를 쓰는 라우트로만 나간다. key 는 index.json 화이트리스트(getStudioItem)
 * 로만 해석되므로 경로 조작이 불가능하다. 베타=무료, STUDIO_PAID_GATE=1 이면 402.
 */

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getStudioItem, STUDIO_VER, type StudioItem } from "@/lib/studio";

export function resolveStudioItem(key: string): StudioItem | null {
  return getStudioItem(key) ?? null;
}

export function paidGateResponse(): NextResponse | null {
  if (process.env.STUDIO_PAID_GATE === "1") {
    return NextResponse.json(
      { error: "유료 도안입니다. 결제 기능 준비 중입니다." },
      { status: 402 },
    );
  }
  return null;
}

export function privateFilePath(item: StudioItem, filename: string): string {
  return path.join(
    process.cwd(), "content-private", "studio", STUDIO_VER, item.skey, filename,
  );
}

export async function servePrivateFile(
  item: StudioItem,
  filename: string,
  contentType: string,
  disposition?: string,
): Promise<NextResponse> {
  const file = privateFilePath(item, filename);
  let buf: Buffer;
  try {
    buf = await fs.readFile(file);
  } catch {
    // 화이트리스트 통과 key 인데 파일이 없으면 404(부재/500 구분으로 열거 힌트 방지).
    // 로그엔 절대경로 대신 skey/파일명만 — 서버 파일시스템 구조 노출 방지.
    console.error(`[studio] missing private file: ${item.skey}/${filename}`);
    return NextResponse.json({ error: "파일을 찾지 못했습니다." }, { status: 404 });
  }
  // SVG 는 스크립트를 품을 수 있어(same-origin 렌더 시 XSS 경로) 엄격 CSP 를 개별 부여.
  const isSvg = contentType.includes("svg");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buf.byteLength),
      ...(disposition ? { "Content-Disposition": disposition } : {}),
      ...(isSvg ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:" } : {}),
      "Cache-Control": "private, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
