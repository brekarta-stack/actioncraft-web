import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import type { QuoteSubmission } from "@/lib/quote-types";

// POST /api/quote — 견적 문의 저장 (누구나 가능)
export async function POST(request: Request) {
  const body = await request.json();

  const submission: QuoteSubmission = {
    id: randomUUID(),
    product: body.product ?? "",
    quantity: body.quantity ?? "",
    deliveryDate: body.deliveryDate ?? "",
    purpose: body.purpose ?? "",
    customDesign: body.customDesign ?? "",
    colorRequest: body.colorRequest ?? "",
    notes: body.notes ?? "",
    name: body.name ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    fileName: body.fileName ?? "",
    createdAt: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from("quotes").insert({
    id: submission.id,
    product: submission.product,
    quantity: submission.quantity,
    delivery_date: submission.deliveryDate,
    purpose: submission.purpose,
    custom_design: submission.customDesign,
    color_request: submission.colorRequest,
    notes: submission.notes,
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    file_name: submission.fileName,
    created_at: submission.createdAt,
  });

  if (error) {
    console.error("[quote] save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const submissions: QuoteSubmission[] = (data ?? []).map((r) => ({
    id: r.id,
    product: r.product,
    quantity: r.quantity,
    deliveryDate: r.delivery_date,
    purpose: r.purpose,
    customDesign: r.custom_design,
    colorRequest: r.color_request,
    notes: r.notes,
    name: r.name,
    email: r.email,
    phone: r.phone,
    fileName: r.file_name,
    createdAt: r.created_at,
  }));

  return NextResponse.json(submissions);
}
