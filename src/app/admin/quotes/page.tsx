import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { QuoteSubmission } from "@/lib/quote-types";
const PRODUCT_LABELS: Record<string, string> = {
  papercraft: "페이퍼 크래프트",
  action:     "액션 페이퍼 토이",
  popup:      "팝업북",
  foamboard:  "폼보드(우드락)",
  unsure:     "미정 (상담 원함)",
  education:  "용도 · 교육/교구",
  promotion:  "용도 · 홍보",
  hobby:      "용도 · 취미",
};

export default async function AdminQuotesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { data, error } = await supabaseAdmin
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  const quotes: QuoteSubmission[] = error
    ? []
    : (data ?? []).map((r) => ({
        id: r.id,
        product: r.product,
        quantity: r.quantity,
        deliveryDate: r.delivery_date,
        purpose: r.purpose,
        customDesign: r.custom_design,
        styleType:    r.style_type ?? "",
        productText:  r.product_text ?? "",
        colorRequest: r.color_request,
        notes: r.notes,
        name: r.name,
        email: r.email,
        phone: r.phone,
        fileName: r.file_name,
        fileUrl: r.file_url ?? "",
        logoFileName: r.logo_file_name ?? "",
        logoFileUrl: r.logo_file_url ?? "",
        sampling:     !!r.sampling,
        rushed:       !!r.rushed,
        packaging:    r.packaging ?? "",
        acquisition:  r.acquisition ?? null,
        createdAt: r.created_at,
      }));

  /* 유입 배지 — 광고(빨강)/일반 유입(회색). acquisition 없으면 렌더 안 함 */
  const acqBadge = (q: QuoteSubmission) => {
    const a = q.acquisition;
    if (!a) return null;
    const isAd = !!(a.adHint || a.gclid || a.utmMedium === "cpc");
    const src = a.utmSource || (a.gclid ? "google" : a.adHint) || "";
    if (!src && !isAd) return null;
    const label = a.utmCampaign ? `${src || "광고"}·${a.utmCampaign}` : src || "광고";
    return (
      <span
        className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
        style={{ background: isAd ? "#FEE2E2" : "#F1F5F9", color: isAd ? "#B91C1C" : "#475569" }}
      >
        {isAd ? "광고 " : "유입 "}
        {label}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">제작 문의</h1>
          <p className="text-slate-500 text-sm mt-0.5">총 {quotes.length}건</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          DB 오류: {(error as { message?: string }).message ?? String(error)}
          <br />
          <span className="text-xs text-red-500 mt-1 block">
            Supabase에 <code>quotes</code> 테이블이 생성되어 있는지 확인하세요.
          </span>
        </div>
      )}

      {quotes.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-slate-600">아직 접수된 제작 문의가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5"
            >
              {/* Row 1: 이름 + 제품 + 날짜 */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📄</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{q.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(q.createdAt).toLocaleString("ko-KR")}
                    </p>
                    {acqBadge(q)}
                  </div>
                </div>
                <span
                  className="text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0"
                  style={{ background: "#F0F2FF", color: "#1E22B2" }}
                >
                  {PRODUCT_LABELS[q.product] ?? q.product}
                </span>
              </div>

              {/* Row 2: 상세 정보 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">수량</p>
                  <p className="font-semibold text-slate-800">{q.quantity || "—"}개</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">납품 희망일</p>
                  <p className="font-semibold text-slate-800">{q.deliveryDate || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">사용 목적</p>
                  <p className="font-semibold text-slate-800">{q.purpose || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-xs text-slate-400 mb-0.5">커스텀 디자인</p>
                  <p className="font-semibold text-slate-800">
                    {q.customDesign === "yes" ? "필요" : q.customDesign === "no" ? "기본" : "—"}
                  </p>
                </div>
              </div>

              {/* Row 3: 연락처 + 요청사항 */}
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href={`mailto:${q.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors text-slate-700"
                >
                  <span>✉️</span> {q.email}
                </a>
                <a
                  href={`tel:${q.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors text-slate-700"
                >
                  <span>📞</span> {q.phone}
                </a>
                {q.fileName && (
                  q.fileUrl ? (
                    <a
                      href={q.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors text-slate-700 text-xs"
                    >
                      📎 {q.fileName} <span className="text-blue-500">↗</span>
                    </a>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 text-xs"
                      title="이 문의는 파일이 실제로 업로드되기 전(구버전 폼)에 접수되어 열 수 없습니다."
                    >
                      📎 {q.fileName} <span className="text-slate-300">(파일 없음)</span>
                    </span>
                  )
                )}
                {q.logoFileName && q.logoFileUrl && (
                  <a
                    href={q.logoFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors text-slate-700 text-xs"
                  >
                    🏷️ {q.logoFileName} <span className="text-blue-500">↗</span>
                  </a>
                )}
              </div>

              {/* 요청사항 */}
              {(q.colorRequest || q.notes) && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600 space-y-1">
                  {q.colorRequest && (
                    <p><span className="font-medium text-slate-700">디자인 요청:</span> {q.colorRequest}</p>
                  )}
                  {q.notes && (
                    <p><span className="font-medium text-slate-700">메모:</span> {q.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
