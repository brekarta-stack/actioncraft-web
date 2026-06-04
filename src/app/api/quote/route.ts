import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Resend } from "resend";
import type { QuoteSubmission } from "@/lib/quote-types";

/* ── 견적 알림 메일 발송 (실패해도 사용자 응답에는 영향 없음) ── */
const PRODUCT_LABEL: Record<string, string> = {
  papercraft: "페이퍼 크래프트",
  action:     "액션 페이퍼 토이",
  popup:      "팝업북",
  foamboard:  "폼보드(우드락)",
  unsure:     "잘 모름 — 담당자 상의 희망",
  education:  "용도 · 교육/교구용",
  promotion:  "용도 · 홍보용",
  hobby:      "용도 · 취미용",
};

async function sendInquiryEmail(s: QuoteSubmission): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to     = process.env.INQUIRY_TO_EMAIL ?? "ceo@actioncraft.co.kr";
  const bcc    = process.env.INQUIRY_BCC_EMAIL;
  const from   = process.env.INQUIRY_FROM_EMAIL ?? "Papercraft Quote <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://papercraft.kr";

  if (!apiKey) {
    console.warn("[api/quote] RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const productLabel = PRODUCT_LABEL[s.product] ?? s.product;
  const STYLE_LABEL: Record<string, string> = {
    realism:      "리얼리즘 (현실적·사진처럼)",
    characterize: "캐릭터라이즈 (캐릭터 원안 최대한 살림)",
    expert:       "전문가 위임 (PE Studio 해석)",
  };
  const PACKAGING_LABEL: Record<string, string> = {
    "paper-box": "종이 박스 (고급)",
    opp:         "OPP 필름 (일반)",
    bulk:        "벌크 납품 (포장 생략)",
  };
  const rows: Array<[string, string]> = [
    ["제품 유형",         productLabel],
    ["샘플링 희망",       s.sampling ? "예 (생산 전 수제작 샘플 발송)" : "아니오"],
    ["수량",              s.quantity || "—"],
    ["희망 납기",         s.rushed ? "최대한 빠르게 (긴급)" : (s.deliveryDate || "—")],
    ["포장 방식",         s.packaging ? (PACKAGING_LABEL[s.packaging] ?? s.packaging) : "—"],
    ["용도",              s.purpose || "—"],
    ["디자인 스타일",     s.styleType ? (STYLE_LABEL[s.styleType] ?? s.styleType) : "—"],
    ["맞춤 디자인 (구)",  s.customDesign === "yes" ? "예" : s.customDesign === "no" ? "아니오" : "—"],
    ["제품 삽입 문구",    s.productText || "—"],
    ["색상·디자인 요청",  s.colorRequest || "—"],
    ["기타 메모",         s.notes || "—"],
    ["담당자 이름",       s.name],
    ["이메일",            s.email],
    ["연락처",            s.phone || "—"],
    ["참고 자료 파일",    s.fileName || "—"],
    ["회사 로고 파일",    s.logoFileName || "—"],
    ["접수 일시",         s.createdAt],
    ["문의 ID",           s.id],
  ];

  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const tableHtml = rows
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:8px 14px;border-bottom:1px solid #eee;background:#fafafa;white-space:nowrap;width:120px;color:#555;font-weight:600;">${esc(k)}</th><td style="padding:8px 14px;border-bottom:1px solid #eee;color:#111;">${esc(v).replace(/\n/g, "<br/>")}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="padding:24px 28px 12px;border-bottom:1px solid #e5e7eb;">
    <div style="font-size:13px;letter-spacing:1px;color:#6366f1;font-weight:700;">PAPERCRAFT.KR · 새 견적 문의</div>
    <h1 style="margin:8px 0 0;font-size:22px;color:#111;">${esc(s.name)} · ${esc(productLabel)}</h1>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">${tableHtml}</table>
  <div style="padding:18px 28px;background:#fafafa;border-top:1px solid #e5e7eb;font-size:13px;color:#555;line-height:1.55;">
    이 메일은 <a href="${siteUrl}/quote" style="color:#6366f1;">papercraft.kr/quote</a> 폼 제출에 의해 자동 발송되었습니다.<br/>
    어드민 페이지에서 전체 목록 확인: <a href="${siteUrl}/admin/quotes" style="color:#6366f1;">${siteUrl}/admin/quotes</a>
  </div>
</div></body></html>`;

  const textLines = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const text = `[papercraft.kr] 새 견적 문의\n\n${textLines}\n\n전체 목록: ${siteUrl}/admin/quotes\n`;

  const resend = new Resend(apiKey);
  const subject = `[papercraft.kr] 새 견적 문의 — ${s.name} · ${productLabel}`;
  await resend.emails.send({
    from,
    to:      [to],
    bcc:     bcc ? [bcc] : undefined,
    replyTo: s.email,
    subject,
    html,
    text,
  });
}

/* ── 입력 스키마 (Zod) ── */
const QuoteSchema = z.object({
  product:      z.enum(["papercraft", "action", "popup", "foamboard", "unsure", "education", "promotion", "hobby"]),
  quantity:     z.string().max(20).default(""),
  deliveryDate: z.string().max(30).default(""),
  purpose:      z.string().max(100).default(""),
  // 기존 customDesign 은 호환 유지 (구버전 제출 케이스), 신규 폼은 styleType 사용
  customDesign: z.enum(["yes", "no", ""]).default(""),
  // 신규: 디자인 스타일 (리얼리즘/캐릭터라이즈/전문가 위임)
  styleType:    z.enum(["realism", "characterize", "expert", ""]).default(""),
  // 신규: 제품에 삽입할 문구
  productText:  z.string().max(200).default(""),
  colorRequest: z.string().max(500).default(""),
  notes:        z.string().max(500).default(""),
  name:         z.string().min(1, "이름은 필수입니다").max(100),
  email:        z.string().email("올바른 이메일을 입력하세요").max(200),
  phone:        z.string().max(30).default(""),
  fileName:     z.string().max(255).default(""),
  // 신규: 회사 로고 파일명 (선택)
  logoFileName: z.string().max(255).default(""),
  // 제작 옵션 (Step 3 확장)
  sampling:     z.boolean().default(false),
  rushed:       z.boolean().default(false),
  packaging:    z.enum(["paper-box", "opp", "bulk", ""]).default(""),
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
    styleType:    data.styleType,
    productText:  data.productText,
    colorRequest: data.colorRequest,
    notes:        data.notes,
    name:         data.name,
    email:        data.email,
    phone:        data.phone,
    fileName:     data.fileName,
    logoFileName: data.logoFileName,
    sampling:     data.sampling,
    rushed:       data.rushed,
    packaging:    data.packaging,
    createdAt:    new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("quotes").insert({
    id:             submission.id,
    product:        submission.product,
    quantity:       submission.quantity,
    delivery_date:  submission.deliveryDate,
    purpose:        submission.purpose,
    custom_design:  submission.customDesign,
    style_type:     submission.styleType,
    product_text:   submission.productText,
    color_request:  submission.colorRequest,
    notes:          submission.notes,
    name:           submission.name,
    email:          submission.email,
    phone:          submission.phone,
    file_name:      submission.fileName,
    logo_file_name: submission.logoFileName,
    sampling:       submission.sampling,
    rushed:         submission.rushed,
    packaging:      submission.packaging,
    created_at:     submission.createdAt,
  });

  if (error) {
    console.error("[api/quote] DB insert error:", error);
    return NextResponse.json({ error: "견적 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }

  /* 알림 메일 발송 — 실패해도 사용자에게는 201 응답 유지 */
  try {
    await sendInquiryEmail(submission);
  } catch (mailErr) {
    console.error("[api/quote] email notification failed:", mailErr);
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
    styleType:    r.style_type ?? "",
    productText:  r.product_text ?? "",
    colorRequest: r.color_request,
    notes:        r.notes,
    name:         r.name,
    email:        r.email,
    phone:        r.phone,
    fileName:     r.file_name,
    logoFileName: r.logo_file_name ?? "",
    sampling:     !!r.sampling,
    rushed:       !!r.rushed,
    packaging:    r.packaging ?? "",
    createdAt:    r.created_at,
  }));

  return NextResponse.json(submissions);
}
