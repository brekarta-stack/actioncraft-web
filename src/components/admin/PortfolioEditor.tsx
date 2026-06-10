"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioItem } from "@/lib/portfolio-types";
import { CATEGORIES, CLIENT_TYPES, SUGGESTED_TAGS } from "@/lib/portfolio-types";
import { prepareImageForUpload, formatResizeNote } from "@/lib/image-resize";
import { slugify, parseYearMonth, autoHyphenYearMonth } from "@/lib/portfolio-meta";

const MAX_IMAGES = 2;

interface Props {
  item?: PortfolioItem;
}

export default function PortfolioEditor({ item }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState<string>(item?.slug ?? "");
  const [summary, setSummary] = useState(item?.summary ?? "");
  const [category, setCategory] = useState<string>(item?.category ?? CATEGORIES[0]);
  const [clientType, setClientType] = useState<string>(item?.clientType ?? "");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(item?.keywords ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [description, setDescription] = useState(item?.description ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [imageAlts, setImageAlts] = useState<(string | null)[]>(() => {
    const base: (string | null)[] = [null, null];
    (item?.imageAlts ?? []).slice(0, 2).forEach((a, i) => { base[i] = a ?? null; });
    return base;
  });

  // slug 자동 생성 미리보기 (사용자가 직접 입력 안 했을 때)
  const slugPreview = useMemo(() => {
    if (slug.trim()) return slugify(slug);
    const auto = [client, title].filter(Boolean).map(slugify).filter(Boolean).join("-");
    return auto || (item ? `case-${item.id.slice(0, 8)}` : "(저장 시 자동 생성)");
  }, [slug, client, title, item]);
  // 최대 2장: index 0 = 대표, index 1 = 호버용
  const [images, setImages] = useState<(string | null)[]>(() => {
    const base: (string | null)[] = [null, null];
    (item?.images ?? []).slice(0, MAX_IMAGES).forEach((url, i) => { base[i] = url; });
    return base;
  });
  const [published, setPublished] = useState(item?.published ?? false);
  /** 홈 "이런 걸 만듭니다" 섹션 노출 여부 */
  const [featured, setFeatured] = useState(item?.featured ?? false);
  /** 제작 시기 (자유 입력 → YYYY-MM 정규화) — 노출 순서 기준. 새 항목은 이번 달 기본값 */
  const [producedAt, setProducedAt] = useState<string>(() =>
    item ? (item.producedAt ?? "").slice(0, 7) : new Date().toISOString().slice(0, 7)
  );
  const producedAtInvalid = parseYearMonth(producedAt) === "invalid";
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null); // slot index
  // "리사이즈 중" / "업로드 중" 같은 진행 단계 표시
  const [uploadStage, setUploadStage] = useState<"resizing" | "uploading" | null>(null);
  // 마지막 업로드의 리사이즈 안내 ("2.4MB → 0.6MB로 줄였어요")
  const [resizeNote, setResizeNote] = useState<string | null>(null);

  // 각 슬롯의 파일 input ref
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleSave = useCallback(
    async (pub?: boolean) => {
      const parsedProducedAt = parseYearMonth(producedAt);
      if (parsedProducedAt === "invalid") {
        alert("제작 시기 형식을 확인해 주세요. 예: 2021-05, 202105, 2021년 5월");
        return;
      }
      setSaving(true);
      const isPublished = pub !== undefined ? pub : published;
      // null 제거해서 실제 URL만 저장
      const cleanImages = images.filter((u): u is string => !!u);
      // imageAlts: 이미지 인덱스에 맞춰 정렬, 빈 칸은 null (서버에서 자동 생성)
      const cleanAlts = images.map((u, i) => (u ? imageAlts[i] ?? "" : null));
      try {
        const body = {
          title,
          slug,
          summary,
          category,
          client,
          clientType: clientType || undefined,
          tags,
          keywords,
          description,
          images: cleanImages,
          imageAlts: cleanAlts,
          published: isPublished,
          featured,
          // 제작 시기 — 노출 순서 기준. 비우면 null(등록일 기준으로 정렬)
          producedAt: parsedProducedAt ? `${parsedProducedAt}-01` : null,
        };
        const res = item
          ? await fetch(`/api/portfolio/${item.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          : await fetch("/api/portfolio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
        if (!res.ok) throw new Error("저장 실패");
        router.push("/admin/portfolio");
        router.refresh();
      } catch {
        alert("저장 중 오류가 발생했습니다.");
      } finally {
        setSaving(false);
      }
    },
    [title, slug, summary, category, client, clientType, tags, keywords, description, images, imageAlts, published, featured, producedAt, item, router]
  );

  function addTag(t: string) {
    const norm = t.trim();
    if (!norm) return;
    if (tags.includes(norm)) return;
    setTags((prev) => [...prev, norm]);
  }
  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }
  function addKeyword(k: string) {
    const norm = k.trim();
    if (!norm) return;
    if (keywords.includes(norm)) return;
    setKeywords((prev) => [...prev, norm]);
  }
  function removeKeyword(k: string) {
    setKeywords((prev) => prev.filter((x) => x !== k));
  }
  function updateAlt(slot: number, value: string) {
    setImageAlts((prev) => {
      const next = [...prev];
      next[slot] = value;
      return next;
    });
  }

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(slot);
      setUploadStage("resizing");
      setResizeNote(null);
      try {
        // 1) 클라이언트에서 자동 리사이즈 (PDF/GIF 는 원본 유지)
        const prepared = await prepareImageForUpload(file);
        const note = formatResizeNote(prepared);
        if (note) setResizeNote(note);

        // 2) 업로드
        setUploadStage("uploading");
        const formData = new FormData();
        formData.append("file", prepared.file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          // 413(Payload Too Large) 은 Vercel 의 body limit (서버 코드 닿기 전 차단)
          if (res.status === 413) {
            throw new Error(
              `파일이 너무 큽니다 (서버 한도 초과). 리사이즈 후에도 ${(prepared.file.size / 1024 / 1024).toFixed(1)}MB 입니다. 더 작은 이미지로 시도하세요.`,
            );
          }
          throw new Error((err as { error?: string }).error ?? "업로드 실패");
        }
        const { url } = await res.json();
        setImages((prev) => {
          const next = [...prev];
          next[slot] = url;
          return next;
        });
      } catch (err) {
        setResizeNote(null);
        alert(err instanceof Error ? err.message : "이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setUploading(null);
        setUploadStage(null);
        e.target.value = "";
      }
    },
    []
  );

  function removeImage(slot: number) {
    setImages((prev) => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
    if (inputRefs[slot]?.current) {
      inputRefs[slot].current!.value = "";
    }
  }

  const slotMeta = [
    { label: "대표 이미지", hint: "갤러리 카드의 기본 이미지", badgeLabel: "대표", badgeColor: "#1E22B2" },
    { label: "호버 이미지", hint: "마우스 오버 시 전환되는 이미지 (선택)", badgeLabel: "호버", badgeColor: "#E91E8C" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/admin/portfolio")}
          className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
        >
          ← 목록으로
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            임시저장
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 text-white font-semibold rounded-lg text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#1E22B2" }}
          >
            {saving ? "저장 중…" : "발행하기"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">작품명</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 경주박물관 도토리 캐릭터 팝업북"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Category + Client */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">클라이언트</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="예: 현대백화점"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              제작 시기 <span className="text-slate-400 font-normal">(노출 순서 기준 · 최신이 앞)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="예: 2021-05 또는 202105"
              maxLength={12}
              value={producedAt}
              onChange={(e) => setProducedAt(autoHyphenYearMonth(e.target.value))}
              onBlur={() => {
                const parsed = parseYearMonth(producedAt);
                if (parsed !== "invalid") setProducedAt(parsed ?? "");
              }}
              className={`w-full px-4 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                producedAtInvalid
                  ? "border-red-400 focus:ring-red-300 bg-red-50"
                  : "border-slate-200 focus:ring-blue-300"
              }`}
            />
            <p className={`text-[11px] mt-1 ${producedAtInvalid ? "text-red-500" : "text-slate-400"}`}>
              {producedAtInvalid
                ? "형식 오류 — 예: 2021-05, 202105, 2021년 5월"
                : "숫자로 직접 입력 (2021-05·202105·2021년 5월) · 비워두면 등록일 기준"}
            </p>
          </div>
        </div>

        {/* Client Type */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            클라이언트 유형 <span className="text-slate-400 font-normal">(SEO 매칭 강화)</span>
          </label>
          <select
            value={clientType}
            onChange={(e) => setClientType(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">— 선택 안 함 —</option>
            {CLIENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Summary (SEO 요약) */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            요약 <span className="text-slate-400 font-normal">(검색·OG에 노출 · 1~2 문장)</span>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="예: 경주박물관 어린이 체험존을 위해 제작한 도토리 캐릭터 팝업 카드. 어린이가 직접 펼치며 전시 주제를 다시 떠올리도록 설계."
            rows={2}
            maxLength={200}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">{summary.length}/200 자 · 비워두면 본문에서 자동 생성</p>
        </div>

        {/* Description (본문) */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">상세 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="제작 배경, 사용된 기법, 수량, 협업 과정 등을 자세히 적으면 검색 노출에 유리합니다. 빈 줄로 문단을 나눌 수 있습니다."
            rows={6}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
          />
        </div>

        {/* URL Slug */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            URL 슬러그 <span className="text-slate-400 font-normal">(비워두면 자동 생성)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="예: gyeongju-museum-acorn-popup"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono text-sm"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            URL 미리보기: <span className="font-mono">/portfolio/{slugPreview}</span>
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            태그 <span className="text-slate-400 font-normal">(검색 매칭 · 사용자 필터)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-slate-400 hover:text-red-500 ml-0.5"
                  aria-label={`${t} 태그 삭제`}
                >
                  ×
                </button>
              </span>
            ))}
            {tags.length === 0 && <span className="text-xs text-slate-400">아직 태그 없음</span>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
              }}
              placeholder="태그 입력 후 Enter (또는 쉼표)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="button"
              onClick={() => { addTag(tagInput); setTagInput(""); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 font-medium"
            >
              추가
            </button>
          </div>
          {/* 추천 태그 */}
          <div className="mt-2 flex flex-wrap gap-1">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 8).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="text-[11px] px-2 py-0.5 rounded-full text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Keywords (meta) */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            추가 SEO 키워드 <span className="text-slate-400 font-normal">(검색용, 화면 미표시)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
            {keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700"
              >
                {k}
                <button
                  type="button"
                  onClick={() => removeKeyword(k)}
                  className="text-emerald-400 hover:text-red-500 ml-0.5"
                  aria-label={`${k} 키워드 삭제`}
                >
                  ×
                </button>
              </span>
            ))}
            {keywords.length === 0 && <span className="text-xs text-slate-400">없음 (선택)</span>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addKeyword(keywordInput);
                  setKeywordInput("");
                }
              }}
              placeholder="예: 어린이박물관 굿즈, STEAM 교구"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="button"
              onClick={() => { addKeyword(keywordInput); setKeywordInput(""); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 font-medium"
            >
              추가
            </button>
          </div>
        </div>

        {/* Published / Featured 토글 */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              onClick={() => setPublished((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                published ? "" : "bg-slate-200"
              }`}
              style={published ? { background: "#1E22B2" } : {}}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                  published ? "left-5" : "left-1"
                }`}
              />
            </div>
            <span className="text-sm text-slate-700 font-medium">공개</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => setFeatured((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                featured ? "" : "bg-slate-200"
              }`}
              style={featured ? { background: "#E91E8C" } : {}}
              title="홈 '이런 걸 만듭니다' 섹션에 노출"
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                  featured ? "left-5" : "left-1"
                }`}
              />
            </div>
            <span className="text-sm text-slate-700 font-medium">
              메인 노출
              <span className="text-xs text-slate-400 ml-1">(홈 9선)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── 이미지 섹션 ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-5">
        <div className="mb-5">
          <h3 className="font-semibold text-slate-900">이미지</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            최대 2장 · 두 번째 이미지는 갤러리에서 마우스 오버 시 자동 전환됩니다
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {slotMeta.map((meta, slot) => {
            const url = images[slot];
            const isLoading = uploading === slot;
            const isDisabled = slot === 1 && !images[0]; // slot 1은 slot 0 먼저

            return (
              <div key={slot}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ background: meta.badgeColor }}
                  >
                    {meta.badgeLabel}
                  </span>
                  <span className="text-xs font-medium text-slate-600">{meta.label}</span>
                </div>

                {url ? (
                  /* ── 이미지 있을 때 ── */
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={meta.label}
                      className="w-full h-full object-cover"
                    />
                    {/* 항상 보이는 삭제 버튼 */}
                    <button
                      onClick={() => removeImage(slot)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                      title="이미지 삭제"
                    >
                      ×
                    </button>
                    {/* 교체 버튼 */}
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="bg-white/90 hover:bg-white text-slate-700 text-xs font-medium px-2 py-1 rounded-lg shadow transition-colors">
                        교체
                      </div>
                      <input
                        ref={inputRefs[slot]}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => handleImageUpload(e, slot)}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  /* ── 이미지 없을 때 ── */
                  <label
                    className={`cursor-pointer block ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}
                  >
                    <div
                      className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                      style={{ borderColor: isDisabled ? undefined : undefined }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-xs text-slate-500 text-center px-2">
                            {uploadStage === "resizing"
                              ? "이미지 처리 중…"
                              : uploadStage === "uploading"
                                ? "업로드 중…"
                                : "처리 중…"}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs text-slate-400 text-center px-2">
                            {isDisabled ? "대표 이미지를 먼저 추가하세요" : "클릭하여 업로드"}
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      ref={inputRefs[slot]}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => handleImageUpload(e, slot)}
                      disabled={isLoading || isDisabled}
                      className="hidden"
                    />
                  </label>
                )}

                <p className="text-[11px] text-slate-400 mt-1.5">{meta.hint}</p>
                {slot === 0 && resizeNote && (
                  <p className="text-[11px] text-emerald-600 mt-0.5" title="자동 리사이즈 안내">
                    ✓ {resizeNote}
                  </p>
                )}
                {url && (
                  <input
                    type="text"
                    value={imageAlts[slot] ?? ""}
                    onChange={(e) => updateAlt(slot, e.target.value)}
                    placeholder={slot === 0 ? "이미지 alt (비우면 자동 생성)" : "디테일 컷 alt (선택)"}
                    className="w-full mt-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating Save Bar — 우하단 앵커 (스크롤 위치 무관 항상 노출) ── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-end gap-2">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-4 py-2.5 bg-white border border-slate-200 shadow-lg rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-5 py-3 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1E22B2", boxShadow: "0 10px 30px -10px rgba(30, 34, 178, 0.5)" }}
        >
          {saving ? "저장 중…" : "발행하기"}
        </button>
      </div>
    </div>
  );
}
