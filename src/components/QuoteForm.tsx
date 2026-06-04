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

type StyleType = "realism" | "characterize" | "expert" | "";
type PackagingType = "paper-box" | "opp" | "bulk" | "";

interface FormState {
  product: ProductType;
  quantity: string;
  deliveryDate: string;
  purpose: string;
  /** Step 2 디자인 스타일 — 리얼리즘 / 캐릭터라이즈 / 전문가 위임 */
  styleType: StyleType;
  /** 제품에 삽입할 문구 (회사명·슬로건 등) */
  productText: string;
  colorRequest: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  /** 참고 자료 파일명 (필수) — 이미지·ai·문서 */
  fileName: string;
  /** 회사 로고 파일명 (선택) */
  logoFileName: string;
  /** 샘플링 희망 — B2B 기업 주문 시 필수 */
  sampling: boolean;
  /** 최대한 빠르게 제작 — 납품 희망일 선택 해제 */
  rushed: boolean;
  /** 포장 방식 — 종이 박스 / OPP 필름 / 벌크 납품 */
  packaging: PackagingType;
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

const STEP_LABELS = ["제품 선택", "디자인 옵션", "제작 옵션", "연락처"];

const INITIAL_FORM: FormState = {
  product: "",
  quantity: "",
  deliveryDate: "",
  purpose: "",
  styleType: "",
  productText: "",
  colorRequest: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
  fileName: "",
  logoFileName: "",
  sampling: false,
  rushed: false,
  packaging: "",
};

const STYLE_OPTIONS: { value: StyleType; label: string; desc: string }[] = [
  { value: "realism",      label: "리얼리즘",     desc: "현실적 스타일로, 사진과 같은 형태로 구현" },
  { value: "characterize", label: "캐릭터라이즈", desc: "캐릭터 원안의 모습을 최대한 살려 구현" },
  { value: "expert",       label: "전문가 위임",  desc: "PE Studio가 적절하게 해석하여 적용" },
];

const PACKAGING_OPTIONS: { value: PackagingType; label: string; desc: string }[] = [
  { value: "paper-box", label: "종이 박스", desc: "제품을 종이 박스로 패키징합니다. 고급 제품에 적합합니다." },
  { value: "opp",       label: "OPP 필름",  desc: "제품을 비닐 필름에 넣어 포장합니다. 일반 제품에 적합합니다." },
  { value: "bulk",      label: "벌크 납품", desc: "포장비를 아껴 저렴하게 제작합니다. 교육 행사 진행에 적합합니다." },
];

/** 제품별 최소 수량 + 최소 납기 (주 단위) — Step 3 동적 안내용 */
const PRODUCT_SPECS: Record<string, { minQty: number; leadWeeks: number; qtyLabel: string; leadLabel: string }> = {
  papercraft: { minQty: 1000, leadWeeks: 6, qtyLabel: "최소 1,000부", leadLabel: "6주 이상" },
  action:     { minQty: 500,  leadWeeks: 4, qtyLabel: "최소 500부",   leadLabel: "약 4주" },
  popup:      { minQty: 1,    leadWeeks: 3, qtyLabel: "최소 1부 ~",   leadLabel: "약 3주" },
  foamboard:  { minQty: 1000, leadWeeks: 6, qtyLabel: "최소 1,000부", leadLabel: "6주 이상" },
  // 용도별 / 미정 — 안내 텍스트만 다르게
  unsure:     { minQty: 1000, leadWeeks: 4, qtyLabel: "1,000부 권장", leadLabel: "약 4주" },
  education:  { minQty: 100,  leadWeeks: 3, qtyLabel: "최소 100부~",  leadLabel: "약 3주" },
  promotion:  { minQty: 500,  leadWeeks: 4, qtyLabel: "최소 500부~",  leadLabel: "약 4주" },
  hobby:      { minQty: 1,    leadWeeks: 3, qtyLabel: "최소 1부~",    leadLabel: "약 3주" },
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

  const update = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (step === 1) return form.product !== "";
    // Step 2: 디자인 옵션 — 참고 자료 + 스타일 필수
    if (step === 2) return form.fileName !== "" && form.styleType !== "";
    // Step 3: 제작 옵션 — 수량 + (희망일 OR 빠른 제작) + 포장 방식 필수
    if (step === 3)
      return form.quantity !== "" && (form.deliveryDate !== "" || form.rushed) && form.packaging !== "";
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

            {/* Step 3: 제작 옵션 — 샘플링 + 수량/납기 + 포장 방식 */}
            {step === 3 && (() => {
              const spec = PRODUCT_SPECS[form.product] ?? PRODUCT_SPECS.unsure;
              // 권장 납품 가능일 = 오늘 + leadWeeks * 7일
              const recommended = new Date();
              recommended.setDate(recommended.getDate() + spec.leadWeeks * 7);
              const minDateISO = recommended.toISOString().split("T")[0];
              return (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                      제작 옵션을 알려주세요
                    </h2>
                    <p className="text-slate-500 text-sm" style={{ wordBreak: "keep-all" }}>
                      샘플링·수량·납기·포장 방식을 함께 알려주시면 가장 정확한 견적을 보내드립니다.
                    </p>
                  </div>

                  {/* 1) 샘플링 체크박스 */}
                  <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.sampling}
                        onChange={(e) => update("sampling", e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-slate-300 text-[#1E22B2] focus:ring-2 focus:ring-[#1E22B2]/30"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">
                          샘플링을 희망합니다
                          <span className="ml-2 text-xs font-medium" style={{ color: "#E91E8C" }}>
                            *B2B 기업 주문 시 필수
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1" style={{ wordBreak: "keep-all" }}>
                          생산 전 완제품을 수제작하여 샘플로 보내드립니다. (회당 추가 비용 및 일정 증가)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* 2) 주문 수량 */}
                  <div>
                    <label htmlFor="qty" className="block text-sm font-semibold text-slate-700 mb-2">
                      주문 수량 <span style={{ color: "#E91E8C" }}>*</span>
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        선택한 제품 기준: {spec.qtyLabel}
                      </span>
                    </label>
                    <input
                      id="qty"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder={`예: ${spec.minQty.toLocaleString()}`}
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 pe-num"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">단위: 개 (세트형은 세트 수 기준)</p>
                  </div>

                  {/* 3) 납품 희망일 + 빠른 제작 체크박스 */}
                  <div>
                    <label htmlFor="due" className="block text-sm font-semibold text-slate-700 mb-2">
                      납품 희망일 <span style={{ color: "#E91E8C" }}>*</span>
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        평균 납기: {spec.leadLabel}
                      </span>
                    </label>
                    <input
                      id="due"
                      type="date"
                      value={form.rushed ? "" : form.deliveryDate}
                      onChange={(e) => {
                        update("deliveryDate", e.target.value);
                        if (e.target.value) update("rushed", false);
                      }}
                      min={minDateISO}
                      disabled={form.rushed}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">
                      최소 납품 가능일: <span className="pe-num">{minDateISO}</span>
                    </p>
                    <label className="mt-2 inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.rushed}
                        onChange={(e) => {
                          update("rushed", e.target.checked);
                          if (e.target.checked) update("deliveryDate", "");
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-[#E91E8C] focus:ring-2 focus:ring-[#E91E8C]/30"
                      />
                      <span className="text-sm text-slate-700">최대한 빠르게 제작</span>
                    </label>
                  </div>

                  {/* 4) 포장 방식 */}
                  <div>
                    <span className="block text-sm font-semibold text-slate-700 mb-3">
                      포장 방식 <span style={{ color: "#E91E8C" }}>*</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PACKAGING_OPTIONS.map((opt) => {
                        const isActive = form.packaging === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => update("packaging", opt.value as string)}
                            aria-pressed={isActive}
                            className={`p-4 rounded-2xl border-2 text-left transition-all pe-paper-lift ${
                              isActive
                                ? "border-[#1E22B2] bg-blue-50"
                                : "border-slate-200 hover:border-blue-200"
                            }`}
                          >
                            <div className="font-semibold text-slate-900 text-sm mb-1">{opt.label}</div>
                            <div className="text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
                              {opt.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5) 사용 목적 (선택) */}
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
              );
            })()}

            {/* Step 3: Design Options */}
            {/* Step 2: Design Options (NEW — 이전 Step 3 자리로 이동 + 확장) */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                    디자인을 어떻게 만들까요?
                  </h2>
                  <p className="text-slate-500 text-sm" style={{ wordBreak: "keep-all" }}>
                    참고 자료와 표현 스타일을 알려주시면 더 정확한 견적이 가능합니다.
                  </p>
                </div>

                {/* 1) 참고 자료 업로드 — 필수 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    참고 자료 업로드 <span style={{ color: "#E91E8C" }}>*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1E22B2] hover:bg-blue-50 transition-colors">
                    <BoxIcon size={28} className="text-slate-400 mb-1" />
                    <span className="text-sm text-slate-700 font-medium" style={{ wordBreak: "keep-all" }}>
                      {form.fileName || "파일을 클릭하거나 드래그하여 첨부"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PDF · AI · PNG · JPG · ZIP (최대 10MB)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.ai,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => update("fileName", e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2" style={{ wordBreak: "keep-all" }}>
                    만들고자 하는 대상/캐릭터의 이미지, ai파일, 참고 문서 등을 업로드해주세요.
                  </p>
                </div>

                {/* 2) 디자인 스타일 — 필수 */}
                <div>
                  <span className="block text-sm font-semibold text-slate-700 mb-3">
                    디자인 스타일 <span style={{ color: "#E91E8C" }}>*</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {STYLE_OPTIONS.map((opt) => {
                      const isActive = form.styleType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update("styleType", opt.value as string)}
                          aria-pressed={isActive}
                          className={`p-4 rounded-2xl border-2 text-left transition-all pe-paper-lift ${
                            isActive
                              ? "border-[#1E22B2] bg-blue-50"
                              : "border-slate-200 hover:border-blue-200"
                          }`}
                        >
                          <div className="font-semibold text-slate-900 text-sm mb-1">{opt.label}</div>
                          <div className="text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3) 제품에 삽입할 문구 */}
                <div>
                  <label htmlFor="productText" className="block text-sm font-semibold text-slate-700 mb-2">
                    제품에 삽입할 문구
                  </label>
                  <input
                    id="productText"
                    type="text"
                    placeholder="예: 회사명·슬로건·이벤트명·QR 코드 옆 문구"
                    value={form.productText}
                    onChange={(e) => update("productText", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E22B2]/30 focus:border-[#1E22B2] text-slate-900"
                  />
                </div>

                {/* 4) 색상 / 디자인 요청사항 */}
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

                {/* 5) 추가 메모 */}
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

                {/* 6) 회사 로고 업로드 — 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    회사 로고 업로드 <span className="text-slate-400 font-normal">(선택)</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1E22B2] hover:bg-blue-50 transition-colors">
                    <span className="text-sm text-slate-600" style={{ wordBreak: "keep-all" }}>
                      {form.logoFileName || "로고 파일 첨부 (SVG·PNG·AI 권장)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".svg,.png,.ai,.pdf,.jpg,.jpeg"
                      onChange={(e) => update("logoFileName", e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
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
                <p className="text-xs text-slate-400" style={{ wordBreak: "keep-all" }}>
                  ※ 참고 자료 파일은 Step 2(디자인 옵션)에서 이미 첨부됨: <strong className="text-slate-600">{form.fileName || "—"}</strong>
                </p>
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
