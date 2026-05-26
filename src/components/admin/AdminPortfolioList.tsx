"use client";

import { useState } from "react";
import type { PortfolioItem } from "@/lib/portfolio-types";

const categoryColors: Record<string, string> = {
  "팝업북": "bg-pink-100 text-pink-700",
  "페이퍼 크래프트": "bg-blue-100 text-blue-700",
  "액션 크래프트": "bg-orange-100 text-orange-700",
  "우드락": "bg-amber-100 text-amber-700",
  "기타": "bg-slate-100 text-slate-600",
};

export default function AdminPortfolioList({ initialItems }: { initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState(initialItems);

  async function deleteItem(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-slate-500">아직 등록된 작품이 없습니다.</p>
        <a
          href="/admin/portfolio/new"
          className="inline-block mt-4 px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          첫 작품 등록하기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4"
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
            {item.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">🖼️</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-slate-900 truncate">{item.title}</h3>
              {item.published ? (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">공개</span>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex-shrink-0">비공개</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] ?? "bg-slate-100 text-slate-600"}`}>
                {item.category}
              </span>
              {item.client && <span>{item.client}</span>}
              <span>이미지 {item.images.length}장</span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <a
              href={`/admin/portfolio/${item.id}/edit`}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
            >
              편집
            </a>
            <button
              onClick={() => deleteItem(item.id)}
              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
