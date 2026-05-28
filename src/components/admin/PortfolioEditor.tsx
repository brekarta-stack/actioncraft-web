"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioItem } from "@/lib/portfolio-types";
import { CATEGORIES } from "@/lib/portfolio-types";

const MAX_IMAGES = 2;

interface Props {
  item?: PortfolioItem;
}

export default function PortfolioEditor({ item }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<string>(item?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(item?.description ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  // 최대 2장: index 0 = 대표, index 1 = 호버용
  const [images, setImages] = useState<(string | null)[]>(() => {
    const base: (string | null)[] = [null, null];
    (item?.images ?? []).slice(0, MAX_IMAGES).forEach((url, i) => { base[i] = url; });
    return base;
  });
  const [published, setPublished] = useState(item?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null); // slot index

  // 각 슬롯의 파일 input ref
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleSave = useCallback(
    async (pub?: boolean) => {
      setSaving(true);
      const isPublished = pub !== undefined ? pub : published;
      // null 제거해서 실제 URL만 저장
      const cleanImages = images.filter((u): u is string => !!u);
      try {
        const body = { title, category, description, client, images: cleanImages, published: isPublished };
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
    [title, category, description, client, images, published, item, router]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(slot);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "업로드 실패");
        }
        const { url } = await res.json();
        setImages((prev) => {
          const next = [...prev];
          next[slot] = url;
          return next;
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : "이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setUploading(null);
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
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작품에 대한 간단한 설명을 입력하세요"
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>

        {/* Published toggle */}
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
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
