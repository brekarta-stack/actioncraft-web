"use client";

import { useState, type FormEvent } from "react";

type ProductType = "papertoy" | "popup" | "edu" | "goods" | "automata" | "event" | "";

interface FormState {
  product: ProductType;
  quantity: string;
  deliveryDate: string;
  purpose: string;
  customDesign: "yes" | "no" | "";
  colorRequest: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  fileName: string;
}

const PRODUCTS = [
  { id: "papertoy", emoji: "🎪", name: "페이퍼토이", desc: "움직이는 종이 완구" },
  { id: "popup", emoji: "📮", name: "팝업카드", desc: "3D 팝업 카드 & 북" },
  { id: "edu", emoji: "📚", name: "교구/교재", desc: "STEAM 교육용 교구" },
  { id: "goods", emoji: "🎁", name: "기업 굿즈", desc: "브랜딩 종이 굿즈" },
  { id: "automata", emoji: "⚙️", name: "오토마타", desc: "정교한 종이 메커니즘" },
  { id: "event", emoji: "🎭", name: "이벤트 소품", desc: "대형 종이 소품" },
];

const PURPOSES = ["마케팅/홍보", "교육", "선물", "전시", "행사", "기타"];

const STEP_LABELS = ["제품 선택", "수량 & 납기", "디자인 옵션", "연락처"];

const INITIAL_FORM: FormState = {
  product: "",
  quantity: "",
  deliveryDate: "",
  purpose: "",
  customDesign: "",
  colorRequest: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
  fileName: "",
};

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (step === 1) return form.product !== "";
    if (step === 2) return form.quantity !== "" && form.deliveryDate !== "";
    if (step === 3) return form.customDesign !== "";
    if (step === 4) return form.name !== "" && form.email !== "" && form.phone !== "";
    return false;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canProceed()) setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setForm(INITIAL_FORM);
  };

  const selectedProduct = PRODUCTS.find((p) => p.id === form.product);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">견적 문의가 접수됐습니다!</h2>
          <p className="text-slate-500 mb-8">
            담당자가 영업일 기준 1-2일 내로 연락드리겠습니다.
            <br />
            추가 문의는 hello@actioncraft.co.kr로 보내주세요.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">제품</span>
              <span className="text-slate-900 font-medium">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">수량</span>
              <span className="text-slate-900 font-medium">{form.quantity}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">납기 희망일</span>
              <span className="text-slate-900 font-medium">{form.deliveryDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">담당자</span>
              <span className="text-slate-900 font-medium">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">이메일</span>
              <span className="text-slate-900 font-medium">{form.email}</span>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            새 견적 문의하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">자동 견적 문의</h1>
          <p className="text-slate-500">원하시는 정보를 입력하시면 맞춤 견적을 보내드립니다.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone
                        ? "bg-orange-500 text-white"
                        : isActive
                          ? "bg-orange-500 text-white ring-4 ring-orange-100"
                          : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isDone ? "✓" : stepNum}
                  </div>
                  <span
                    className={`text-xs mt-1.5 hidden sm:block ${
                      isActive ? "text-orange-600 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isDone ? "bg-orange-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Product Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  어떤 제품을 원하시나요?
                </h2>
                <p className="text-slate-500 text-sm mb-6">해당하는 제품 종류를 선택해주세요.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRODUCTS.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => update("product", product.id)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        form.product === product.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{product.emoji}</div>
                      <div className="font-semibold text-slate-900 text-sm">{product.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{product.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Quantity & Delivery */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    수량과 납기를 알려주세요
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    정확한 수량이 없다면 예상 수량을 입력해주세요.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    주문 수량 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="예: 100"
                    value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900"
                  />
                  <p className="text-xs text-slate-400 mt-1">단위: 개 (세트형은 세트 수 기준)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    납품 희망일 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => update("deliveryDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    사용 목적
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PURPOSES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update("purpose", p)}
                        className={`py-2.5 px-3 text-sm rounded-xl border-2 transition-colors ${
                          form.purpose === p
                            ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold"
                            : "border-slate-200 text-slate-600 hover:border-orange-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Design Options */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    디자인 옵션을 선택해주세요
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    커스텀 디자인 적용 여부를 알려주세요.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    커스텀 디자인 <span className="text-orange-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        value: "yes",
                        label: "커스텀 필요",
                        desc: "로고, 색상, 이미지 등 맞춤 디자인 적용",
                        icon: "🎨",
                      },
                      {
                        value: "no",
                        label: "기본 디자인",
                        desc: "CES 기본 디자인으로 제작",
                        icon: "📦",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => update("customDesign", opt.value)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          form.customDesign === opt.value
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 hover:border-orange-200"
                        }`}
                      >
                        <div className="text-2xl mb-2">{opt.icon}</div>
                        <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    색상 / 디자인 요청사항
                  </label>
                  <textarea
                    rows={3}
                    placeholder="예: 회사 브랜드 컬러(파란색 계열)로 제작, 로고 삽입 원함"
                    value={form.colorRequest}
                    onChange={(e) => update("colorRequest", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    추가 메모
                  </label>
                  <textarea
                    rows={2}
                    placeholder="기타 요청사항을 자유롭게 입력해주세요."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    연락처를 입력해주세요
                  </h2>
                  <p className="text-slate-500 text-sm mb-6">
                    견적서를 보내드릴 연락처를 입력해주세요.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    이름 / 담당자명 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    이메일 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@company.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    연락처 <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    파일 첨부 (선택)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                    <span className="text-3xl mb-1">📎</span>
                    <span className="text-sm text-slate-500">
                      {form.fileName || "파일을 클릭하거나 드래그하여 첨부"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PDF, AI, PNG, JPG (최대 10MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.ai,.png,.jpg,.jpeg"
                      onChange={(e) => update("fileName", e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-2.5 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                >
                  ← 이전
                </button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className={`px-8 py-2.5 font-semibold rounded-xl transition-colors ${
                    canProceed()
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  다음 →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canProceed()}
                  className={`px-8 py-2.5 font-semibold rounded-xl transition-colors ${
                    canProceed()
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  견적 문의 제출 🚀
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-700">
          <span className="flex-shrink-0">ℹ️</span>
          <span>
            제출 후 영업일 기준 1-2일 내에 담당자가 견적서를 이메일로 발송합니다. 급한 문의는
            02-000-0000으로 전화해주세요.
          </span>
        </div>
      </div>
    </div>
  );
}
