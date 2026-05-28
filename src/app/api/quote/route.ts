import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { QuoteSubmission } from "@/lib/quote-types";

/* ── 입력 스키마 (Zod) ── */
const QuoteSchema = z.object({
  product:      z.enum(["papercraft", "action", "popup", "foamboard", "unsure"]),
  quantity:     z.string().max(20).default(""),
  deliveryDate: z.string().max(30).default(""),
  purpose:      z.string().max(100).default(""),
  customDesign: z.enum(["yes", "no", ""]).default(""),
  colorRequest: z.string().max(500).default(""),
  notes:        z.string().max(500).default(""),
  name:         z.string().min(1, "이름은 필수입니다").max(100),
  email:        z.string().email("올바른 이메일을 입력하세요").max(200),
  phone:        z.string().max(30).default(""),
  fileName:     z.string().max(255).default(""),
});

/* ── 단순 IP 레이트 리밋 (분당 5회) ── */
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS  = 60_000;

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

// POST /api/quote — 견적 문의 저장 (누구나 가능)
export async function POST(request: Request) {
  /* 레이트 리밋 */
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  /* 입력 파싱 & 검증 */
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const data = parsed.data;
  const submission: QuoteSubmission = {
    id:           randomUUID(),
    product:      data.product,
    quantity:     data.quantity,
    deliveryDate: data.deliveryDate,
    purpose:      data.purpose,
    customDesign: data.customDesign,
    colorRequest: data.colorRequest,
    notes:        data.notes,
    name:         data.name,
    email:        data.email,
    phone:        data.phone,
    fileName:     data.fileName,
    createdAt:    new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("quotes").insert({
    id:            submission.id,
    product:       submission.product,
    quantity:      submission.quantity,
    delivery_date: submission.deliveryDate,
    purpose:       submission.purpose,
    custom_design: submission.customDesign,
    color_request: submission.colorRequest,
    notes:         submission.notes,
    name:          submission.name,
    email:         submission.email,
    phone:         submission.phone,
    file_name:     submission.fileName,
    created_at:    submission.createdAt,
  });

  if (error) {
    console.error("[api/quote] DB insert error:", error);
    return NextResponse.json({ error: "견적 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  return NextResponse.json(submission, { status: 201 });
}

// GET /api/quote — 어드민 전용 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/quote] DB select error:", error);
    return NextResponse.json({ error: "데이터를 불러오지 못했습니다." }, { status: 500 });
  }

  const submissions: QuoteSubmission[] = (data ?? []).map((r) => ({
    id:           r.id,
    product:      r.product,
    quantity:     r.quantity,
    deliveryDate: r.delivery_date,
    purpose:      r.purpose,
    customDesign: r.custom_design,
    colorRequest: r.color_request,
    notes:        r.notes,
    name:         r.name,
    email:        r.email,
    phone:        r.phone,
    fileName:     r.file_name,
    createdAt:    r.created_at,
  }));

  return NextResponse.json(submissions);
}
