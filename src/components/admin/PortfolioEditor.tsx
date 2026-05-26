"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PortfolioItem } from "@/lib/portfolio-types";
import { CATEGORIES } from "@/lib/portfolio-types";

interface Props {
  item?: PortfolioItem;
}

export default function PortfolioEditor({ item }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<string>(item?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(item?.description ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [images, setImages] = useState<string[]>(item?.images ?? []);
  const [published, setPublished] = useState(item?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = useCallback(
    async (pub?: boolean) => {
      setSaving(true);
      const isPublished = pub !== undefined ? pub : published;
      try {
        const body = { title, category, description, client, images, published: isPublished };
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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      setUploading(true);
      try {
        const urls: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) throw new Error("업로드 실패");
          const { url } = await res.json();
          urls.push(url);
        }
        setImages((prev) => [...prev, ...urls]);
      } catch {
        alert("이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    []
  );

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const arr = [...prev];
      const [el] = arr.splice(from, 1);
      arr.splice(to, 0, el);
      return arr;
    });
  }

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
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
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
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Category + Client */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setPublished((v) => !v)}
            className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
              published ? "bg-orange-500" : "bg-slate-200"
            }`}
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

      {/* Image Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">이미지</h3>
          <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            {uploading ? "업로드 중…" : "🖼️ 이미지 추가"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-32 flex items-center justify-center text-slate-400 text-sm">
            이미지를 추가하세요 (여러 장 가능, 첫 번째 이미지가 대표 이미지)
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={url + i} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-slate-200"
                />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                    대표
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {i > 0 && (
                    <button
                      onClick={() => moveImage(i, i - 1)}
                      className="w-7 h-7 bg-white/90 rounded-full text-slate-700 text-xs font-bold flex items-center justify-center hover:bg-white"
                      title="앞으로"
                    >
                      ←
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="w-7 h-7 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center hover:bg-red-600"
                    title="삭제"
                  >
                    ×
                  </button>
                  {i < images.length - 1 && (
                    <button
                      onClick={() => moveImage(i, i + 1)}
                      className="w-7 h-7 bg-white/90 rounded-full text-slate-700 text-xs font-bold flex items-center justify-center hover:bg-white"
                      title="뒤로"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-3">이미지 위에 마우스를 올려 순서 변경 또는 삭제할 수 있습니다.</p>
      </div>
    </div>
  );
}
