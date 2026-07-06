/**
 * POST /api/studio/class/pdf — 학급 세트 묶음 인쇄 PDF (웹 M4).
 * 본문 {items:[{skey, qty}]} → 각 모형의 인쇄 PDF 를 수량만큼 이어붙인 한
 * 파일. 교사는 인쇄 대화상자 한 번으로 반 전체 분량을 뽑는다.
 * 원본 PDF 는 비공개 폴더(유료 자산) — key 는 화이트리스트로만 해석,
 * 총 장수 상한(400)으로 남용·메모리를 막는다. 베타=무료(유료 게이트 공유).
 */

import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import {
  CLASS_MAX_ITEMS,
  CLASS_MAX_QTY,
  CLASS_MAX_SHEETS,
} from "@/lib/studio-class-shared.mjs";
import { paidGateResponse, privateFilePath, resolveStudioItem } from "@/lib/studio-server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const gate = paidGateResponse();
  if (gate) return gate;

  let body: { items?: Array<{ skey?: string; qty?: number }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const rows = Array.isArray(body.items) ? body.items : [];
  if (rows.length === 0 || rows.length > CLASS_MAX_ITEMS) {
    return NextResponse.json(
      { error: `모형은 1~${CLASS_MAX_ITEMS}종까지 담을 수 있어요.` },
      { status: 400 },
    );
  }

  const resolved: Array<{ skey: string; qty: number }> = [];
  let sheets = 0;
  for (const r of rows) {
    const item = resolveStudioItem(String(r.skey ?? ""));
    const qty = Math.floor(Number(r.qty));
    if (!item || !Number.isFinite(qty) || qty < 1 || qty > CLASS_MAX_QTY) {
      return NextResponse.json({ error: "잘못된 모형 또는 수량입니다." }, { status: 400 });
    }
    sheets += item.pdf_pages * qty; // 실제 인쇄 장수(도면+조립 안내) 기준
    resolved.push({ skey: item.skey, qty });
  }
  if (sheets > CLASS_MAX_SHEETS) {
    return NextResponse.json(
      { error: `묶음 인쇄는 총 ${CLASS_MAX_SHEETS}장까지예요. (현재 ${sheets}장)` },
      { status: 400 },
    );
  }

  const merged = await PDFDocument.create();
  merged.setTitle("학급 세트 종이모형 (papercraft.kr)");
  for (const r of resolved) {
    const item = resolveStudioItem(r.skey)!;
    let src: PDFDocument;
    try {
      src = await PDFDocument.load(await readFile(privateFilePath(item, "print.pdf")));
    } catch {
      console.error(`[studio/class] PDF 없음: ${r.skey}`);
      return NextResponse.json({ error: "도안 파일을 찾지 못했습니다." }, { status: 500 });
    }
    const idx = src.getPageIndices();
    for (let c = 0; c < r.qty; c++) {
      const pages = await merged.copyPages(src, idx);
      for (const p of pages) merged.addPage(p);
    }
  }
  const bytes = await merged.save();

  const filename = encodeURIComponent("학급 세트 종이모형 (papercraft.kr).pdf");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
