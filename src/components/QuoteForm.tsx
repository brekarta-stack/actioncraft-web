"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PaperToyIcon,
  GearIcon,
  BoxIcon,
  PencilIcon,
  SparkleIcon,
  EducationIcon,
  CheckIcon,
  ArrowRightIcon,
  type IconKey,
} from "@/components/icons";

type ProductType =
  | "papercraft"
  | "action"
  | "popup"
  | "foamboard"
  | "unsure"
  | "education"
  | "promotion"
  | "hobby"
  | "";

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

const PRODUCTS: { id: ProductType; icon: IconKey; name: string; desc: string }[] = [
  { id: "papercraft", icon: "paperToy", name: "페이퍼 크래프트",    desc: "기본적인 종이 모형에서 정교한 설계까지" },
  { id: "action",     icon: "gear",     name: "액션 페이퍼 토이",   desc: "특허 기반 움직임 메커니즘 적용" },
  { id: "popup",      icon: "sparkle",  name: "팝업북",              desc: "3D 팝업 카드 및 북 제작" },
  { id: "foamboard",  icon: "box",      name: "폼보드(우드락)",     desc: "끼워 만드는 입체 구조" },
];

const USAGES: { id: ProductType; icon: IconKey; name: string; desc: string }[] = [
  { id: "education", icon: "education", name: "교육/교구용", desc: "체험존·교구·STEAM 학습 도구" },
  { id: "promotion", icon: "sparkle",   name: "홍보용",      desc: "브랜드 굿즈·캠페인·전시 부스" },
  { id: "hobby",     icon: "pencil",    name: "취미용",      desc: "가족·동호회·개인 만들기 키트" },
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

const STORAGE_KEY = "pe-quote-form-draft";

/** 아이콘 색상 — 카드 활성/비활성 통일 */
function ProductIconRender({ name }: { name: IconKey }) {
  switch (name) {
    case "paperToy":  return <PaperToyIcon size={28} />;
    case "gear":      return <GearIcon size={28} />;
    case "sparkle":   return <SparkleIcon size={28} />;
    case "box":       return <BoxIcon size={28} />;
    case "pencil":    return <PencilIcon size={28} />;
    case "education": return <EducationIcon size={28} />;
    default:          return <PaperToyIcon size={28} />;
  }
}

/** 어떤 모드의 선택지인지 판별 */
const USAGE_IDS: ProductType[] = ["education", "promotion", "hobby"];
function isUsageId(id: ProductType): boolean {
  return USAGE_IDS.includes(id);
}

export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [hydrated, setHydrated] = useState(false);
  /** Step 1 선택 모드 — 제품 종류별 / 용도별 토글 */
  const [step1Mode, setStep1Mode] = useState<"product" | "usage">("product");

  // localStorage 에서 작성 중인 폼 복원 (이탈 방지)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (typeof parsed.step === "number") setStep(Math.min(Math.max(parsed.step, 1), 4));
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // 변경 시마다 저장
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
    } catch {
      // ignore quota errors
    }
  }, [form, step, hydrated]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canProceed()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("제출 실패");
      setSubmitted(true);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      alert("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setForm(INITIAL_FORM);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const selectedProduct =
    PRODUCTS.find((p) => p.id === form.product) ?? USAGES.find((u) => u.id === form.product);

  /* ────────── 제출 완료 화면 ────────── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl pe-paper-shadow-lg p-10 text-center border border-slate-100">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-white pe-paper-shadow"
            style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
            aria-hidden
          >
            <CheckIcon size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
            견적 문의가 접수됐습니다
          </h2>
          <p className="text-slate-500 mb-8" style={{ wordBreak: "keep-all" }}>
            담당자가 영업일 기준 <strong className="text-slate-900">1~2일 내</strong>로 회신 드립니다.
            <br />
            추가 문의는 <strong className="text-slate-900">ask@papercraft.kr</strong> 로 보내주세요.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-6 space-y-2.5 text-sm border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">제품</span>
              <span className="text-slate-900 font-medium">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">수량</span>
              <span className="text-slate-900 font-medium pe-num">{form.quantity}개</span>
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
              <span className="text-slate-900 font-medium text-xs">{form.email}</span>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-full py-3 font-semibold rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
          >
            새 견적 문의하기
          </button>
        </div>
      </div>
    );
  }

  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#E91E8C" }}>
            Quick Quote · 1분이면 충분합니다
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            페이퍼 엔지니어링 <span className="pe-gradient-text">자동 견적</span>
          </h1>
          <p className="text-slate-500" style={{ wordBreak: "keep-all" }}>
            제품 정보를 입력하시면 영업일 1~2일 내 맞춤 견적을 보내드립니다.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-semibold text-slate-700">
              Step <span className="pe-num">{step}</span> of <span className="pe-num">{STEP_LABELS.length}</span> ·{" "}
              <span style={{ color: "#1E22B2" }}>{STEP_LABELS[step - 1]}</span>
            </span>
            <span className="text-slate-400 pe-num">{Math.round(((step) / STEP_LABELS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.round(((step) / STEP_LABELS.length) * 100)}%`,
                background: "linear-gradient(90deg, #06C6C8, #F5C518, #E91E8C)",
              }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => isDone && setStep(stepNum)}
                  disabled={!isDone}
                  className={`text-xs flex-1 text-center transition-colors ${
                    isActive
                      ? "font-bold"
                      : isDone
                        ? "text-slate-600 hover:text-slate-900 cursor-pointer"
                        : "text-slate-400"
                  }`}
                  style={isActive ? { color: "#1E22B2" } : {}}
                  aria-label={`${label} 단계${isActive ? " (현재)" : isDone ? " (완료)" : ""}`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{stepNum}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl pe-paper-shadow border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Product Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                  어떤 제품을 원하시나요?
                </h2>
                <p className="text-slate-500 text-sm mb-4" style={{ wordBreak: "keep-all" }}>
                  제품 종류를 알고 계시면 종류별로, 잘 모르시면 용도별로 선택하세요.
                </p>

                {/* 선택 모드 토글 */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl mb-5">
                  <button
                    type="button"
                    onClick={() => setStep1Mode("product")}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      step1Mode === "product"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    제품 종류별
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep1Mode("usage")}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                      step1Mode === "usage"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    용도별
                  </button>
                </div>

                {step1Mode === "product" ? (
                  /* 2 × 2 제품 종류 */
                  <div className="grid grid-cols-2 gap-3">
                    {PRODUCTS.map((product) => {
                      const isActive = form.product === product.id;
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => update("product", product.id)}
                          aria-pressed={isActive}
                          className={`p-4 rounded-2xl border-2 text-center transition-all pe-paper-lift ${
                            isActive
                              ? "border-[#1E22B2] bg-blue-50"
                              : "border-slate-200 hover:border-blue-200 bg-white"
                          }`}
                        >
                          <div
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
                            style={{
                              background: isActive ? "#1E22B2" : "#F0F2FF",
                              color: isActive ? "white" : "#1E22B2",
                            }}
                            aria-hidden
                          >
                            <ProductIconRender name={product.icon} />
                          </div>
                          <div className="font-semibold text-slate-900 text-sm">{product.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5" style={{ wordBreak: "keep-all" }}>
                            {product.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* 1 × 3 용도별 */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {USAGES.map((usage) => {
                      const isActive = form.product === usage.id;
                      return (
                        <button
                          key={usage.id}
                          type="button"
                          onClick={() => update("product", usage.id)}
                          aria-pressed={isActive}
                          className={`p-4 rounded-2xl border-2 text-center transition-all pe-paper-lift ${
                            isActive
                              ? "border-[#06C6C8] bg-cyan-50"
                              : "border-slate-200 hover:border-cyan-200 bg-white"
                          }`}
                        >
                          <div
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
                            style={{
                              background: isActive ? "#06C6C8" : "#E0FAFB",
                              color: isActive ? "white" : "#06C6C8",
                            }}
                            aria-hidden
                          >
                            <ProductIconRender name={usage.icon} />
                          </div>
                          <div className="font-semibold text-slate-900 text-sm">{usage.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5" style={{ wordBreak: "keep-all" }}>
                            {usage.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* "잘 모르겠어요" 옵션 — 두 모드 공통 */}
                <button
                  type="button"
                  onClick={() => update("product", "unsure")}
                  aria-pressed={form.product === "unsure"}
                  className={`mt-3 w-full p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    form.product === "unsure"
                      ? "border-[#1E22B2] bg-blue-50 text-[#1E22B2]"
                      : "border-dashed border-slate-300 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  잘 모르겠어요 — 담당자와 상의하고 싶어요
                </button>
              </div>
            )}

            {/* Step 2: Quantity & Delivery */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                    수량과 납기를 알려주세요
                  </h2>
                  <p className="text-slate-500 text-sm" style={{ wordBreak: "keep-all" }}>
                    정확한 수량이 없다면 예상 수량을 입력해 주세요. (최소 1,000부부터 제작 가능)
                  </p>
                </div>
                <div>
                  <label htmlFor="qty" className="block text-sm font-semibold text-slate-700 mb-2">
                    주문 수량 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    id="qty"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    placeholder="예: 1000"
                    value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 pe-num"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">단위: 개 (세트형은 세트 수 기준)</p>
                </div>
                <div>
                  <label htmlFor="due" className="block text-sm font-semibold text-slate-700 mb-2">
                    납품 희망일 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    id="due"
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => update("deliveryDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">평균 납기 3~4주 · 급할 경우 미리 알려주세요</p>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-700 mb-2">사용 목적</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PURPOSES.map((p) => {
                      const isActive = form.purpose === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => update("purpose", p)}
                          aria-pressed={isActive}
                          className={`py-2.5 px-3 text-sm rounded-xl border-2 transition-colors ${
                            isActive
                              ? "border-[#1E22B2] bg-blue-50 text-[#1E22B2] font-semibold"
                              : "border-slate-200 text-slate-600 hover:border-blue-200"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Design Options */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                    디자인 옵션을 선택해 주세요
                  </h2>
                  <p className="text-slate-500 text-sm" style={{ wordBreak: "keep-all" }}>
                    커스텀 디자인 적용 여부를 알려주세요.
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-700 mb-3">
                    커스텀 디자인 <span style={{ color: "#E91E8C" }}>*</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "yes",
                        label: "커스텀 필요",
                        desc: "로고·색상·이미지 등 맞춤 디자인 적용",
                        icon: "pencil" as IconKey,
                      },
                      {
                        value: "no",
                        label: "기본 디자인",
                        desc: "PE Studio 기본 디자인으로 제작",
                        icon: "box" as IconKey,
                      },
                    ].map((opt) => {
                      const isActive = form.customDesign === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("customDesign", opt.value)}
                          aria-pressed={isActive}
                          className={`p-4 rounded-2xl border-2 text-left transition-all pe-paper-lift ${
                            isActive
                              ? "border-[#1E22B2] bg-blue-50"
                              : "border-slate-200 hover:border-blue-200"
                          }`}
                        >
                          <div
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2"
                            style={{
                              background: isActive ? "#1E22B2" : "#F0F2FF",
                              color: isActive ? "white" : "#1E22B2",
                            }}
                            aria-hidden
                          >
                            {opt.icon === "pencil" ? <PencilIcon size={24} /> : <BoxIcon size={24} />}
                          </div>
                          <div className="font-semibold text-slate-900 text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-500 mt-1" style={{ wordBreak: "keep-all" }}>{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="color" className="block text-sm font-semibold text-slate-700 mb-2">
                    색상 / 디자인 요청사항
                  </label>
                  <textarea
                    id="color"
                    rows={3}
                    placeholder="예: 회사 브랜드 컬러(파란색 계열)로 제작, 로고 삽입 원함"
                    value={form.colorRequest}
                    onChange={(e) => update("colorRequest", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                    추가 메모
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="기타 요청사항을 자유롭게 입력해 주세요."
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Contact Info */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                    연락처를 입력해 주세요
                  </h2>
                  <p className="text-slate-500 text-sm" style={{ wordBreak: "keep-all" }}>
                    견적서를 보내드릴 연락처를 입력해 주세요.
                  </p>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    이름 / 담당자명 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    이메일 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="example@company.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    연락처 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 pe-num"
                  />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-700 mb-2">파일 첨부 (선택)</span>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1E22B2] hover:bg-blue-50 transition-colors">
                    <BoxIcon size={28} className="text-slate-400 mb-1" />
                    <span className="text-sm text-slate-600" style={{ wordBreak: "keep-all" }}>
                      {form.fileName || "파일을 클릭하거나 드래그하여 첨부"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PDF · AI · PNG · JPG (최대 10MB)</span>
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

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100 transition-colors text-sm sm:text-base"
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
                  className={`inline-flex items-center gap-1.5 px-7 py-3 font-semibold rounded-xl transition-all ${
                    canProceed()
                      ? "text-white shadow-lg shadow-pink-500/20 hover:-translate-y-0.5"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  style={canProceed() ? { background: "linear-gradient(135deg, #06C6C8, #E91E8C)" } : {}}
                >
                  다음
                  <ArrowRightIcon size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canProceed() || saving}
                  className={`inline-flex items-center gap-1.5 px-7 py-3 font-semibold rounded-xl transition-all ${
                    canProceed() && !saving
                      ? "text-white shadow-lg shadow-pink-500/25 hover:-translate-y-0.5"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  style={canProceed() && !saving ? { background: "linear-gradient(135deg, #06C6C8, #E91E8C)" } : {}}
                >
                  {saving ? "제출 중…" : "견적 문의 제출"}
                  {!saving && <ArrowRightIcon size={18} />}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3 text-sm text-blue-900 border border-blue-100">
          <CheckIcon size={18} className="flex-shrink-0 mt-0.5 text-blue-700" />
          <span style={{ wordBreak: "keep-all" }}>
            제출 후 영업일 기준 <strong>1~2일 내</strong>로 담당자가 견적서를 이메일로 발송합니다.
            중간에 페이지를 벗어나도 작성 내용은 자동 저장되니 안심하고 작성해 주세요.
          </span>
        </div>
      </div>
    </div>
  );
}
