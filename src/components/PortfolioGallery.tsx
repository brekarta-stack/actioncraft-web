"use client";

import { useState } from "react";
import type { PortfolioItem, Category } from "@/lib/portfolio-types";

const categoryColors: Record<string, string> = {
  "팝업북": "bg-pink-100 text-pink-700",
  "페이퍼 크래프트": "bg-blue-100 text-blue-700",
  "액션 크래프트": "bg-orange-100 text-orange-700",
  "우드락": "bg-amber-100 text-amber-700",
  "기타": "bg-slate-100 text-slate-600",
};

interface Props {
  items: PortfolioItem[];
  categories: Category[];
}

export default function PortfolioGallery({ items, categories }: Props) {
  const [active, setActive] = useState<string>("전체");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const tabs = ["전체", ...categories];
  const filtered =
    active === "전체" ? items : items.filter((i) => i.category === active);

  function openLightbox(images: string[], index: number) {
    setLightbox({ images, index });
  }

  function closeLightbox() {
    setLightbox(null);
  }

  function prevImage() {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
    });
  }

  function nextImage() {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index + 1) % lightbox.images.length,
    });
  }

  return (
    <>
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              active === tab
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-slate-500 text-lg">아직 등록된 작품이 없습니다.</p>
          <p className="text-slate-400 text-sm mt-2">곧 멋진 작품들로 채워질 예정입니다!</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow group"
          >
            {/* Thumbnail */}
            <div
              className="relative h-56 bg-slate-100 cursor-pointer overflow-hidden"
              onClick={() => item.images.length > 0 && openLightbox(item.images, 0)}
            >
              {item.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {item.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  +{item.images.length - 1}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    categoryColors[item.category] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.category}
                </span>
                {item.client && (
                  <span className="text-xs text-slate-400">{item.client}</span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
            onClick={closeLightbox}
          >
            ×
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white/70 hover:text-white p-2 text-3xl"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white/70 hover:text-white p-2 text-3xl"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 flex gap-2">
              {lightbox.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: i }); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === lightbox.index ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
