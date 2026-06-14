import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { parseAcquisition, parseSearchKeyword } from "@/lib/analytics";

/**
 * POST /api/track — 유입·클릭 이벤트 수집 (누구나 / 익명)
 *
 * 브라우저(src/instrumentation-client.ts)가 navigator.sendBeacon 으로 호출한다.
 * 개인정보(IP·원본 UA)는 저장하지 않으며, referrer/UTM 은 서버에서 source/medium 으로
 * 변환해 저장한다. 응답 본문은 없다(204) — sendBeacon 은 응답을 읽지 않는다.
 */

/* ── 입력 스키마 ── */
const TrackSchema = z.object({
  type: z.enum(["pageview", "click", "dwell"]),
  path: z.string().max(512).default(""),
  referrer: z.string().max(1024).optional().default(""),
  utmSource: z.string().max(120).optional().default(""),
  utmMedium: z.string().max(120).optional().default(""),
  utmCampaign: z.string().max(120).optional().default(""),
  utmTerm: z.string().max(200).optional().default(""),
  gclid: z.string().max(400).optional().default(""),
  adHint: z.enum(["google", "naver", ""]).optional().default(""),
  label: z.string().max(200).optional().default(""),
  href: z.string().max(1024).optional().default(""),
  durationMs: z.number().int().min(0).max(3_600_000).optional(),
  sessionId: z.string().max(64).optional().default(""),
  device: z.enum(["mobile", "desktop", ""]).optional().default(""),
});

/* ── 간단 IP 레이트 리밋 (분당 300회 — 한 세션의 다수 클릭 허용, 봇 폭주만 차단) ── */
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 300;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

/** 사이트 호스트 (내부 이동 판별용) */
const SITE_HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://papercraft.kr";
  try {
    return new URL(url).hostname;
  } catch {
    return "papercraft.kr";
  }
})();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    // 조용히 무시 (수집 실패는 사용자 경험에 영향 없음)
    return new NextResponse(null, { status: 204 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = TrackSchema.safeParse(raw);
  if (!parsed.success) return new NextResponse(null, { status: 204 });
  const e = parsed.data;

  // 어드민/내부 API 경로는 수집하지 않음 (방어적 — 클라이언트도 제외함)
  if (e.path.startsWith("/admin") || e.path.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  // 유입 출처 파싱 (서버에서 일관 처리)
  const { source, medium } = parseAcquisition({
    referrer: e.referrer,
    utmSource: e.utmSource,
    utmMedium: e.utmMedium,
    gclid: e.gclid,
    adHint: e.adHint,
    siteHost: SITE_HOST,
  });

  // 검색어: 광고 키워드(utm_term) 우선, 없으면 referrer 의 검색 쿼리(대개 비어 있음)
  const keyword = (e.utmTerm.trim() || parseSearchKeyword(e.referrer)).slice(0, 120) || null;

  const { error } = await supabaseAdmin.from("analytics_events").insert({
    type: e.type,
    path: e.path || "/",
    referrer: e.referrer || null,
    source,
    medium,
    utm_source: e.utmSource || null,
    utm_medium: e.utmMedium || null,
    utm_campaign: e.utmCampaign || null,
    keyword,
    label: e.type === "click" ? e.label || null : null,
    href: e.type === "click" ? e.href || null : null,
    duration_ms: e.type === "dwell" ? (e.durationMs ?? null) : null,
    session_id: e.sessionId || null,
    device: e.device || null,
  });

  if (error) {
    console.error("[api/track] insert error:", error.message);
    // 테이블 미생성 등도 사용자에겐 영향 없음 → 204
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
