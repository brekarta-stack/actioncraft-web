"use client";

import { useState } from "react";
import type { PortfolioItem, Category } from "@/lib/portfolio-types";

const categoryColors: Record<string, { bg: string; text: string }> = {
  "팝업북":       { bg: "#FFF0F6", text: "#E91E8C" },
  "페이퍼 크래프트": { bg: "#EEF0FF", text: "#1E22B2" },
  "액션 크래프트": { bg: "#FFF3F9", text: "#E91E8C" },
  "우드락":       { bg: "#FFFBEB", text: "#B45309" },
  "기타":         { bg: "#F1F5F9", text: "#475569" },
};

interface Props {
  items: PortfolioItem[];
  categories: Category[];
}

/* ─── 카드 컴포넌트 (hover 상태 관리) ─── */
function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  onOpen: (images: string[], index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hasHoverImage = item.images.length > 1;
  const col = categoryColors[item.category] ?? { bg: "#F1F5F9", text: "#475569" };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => item.images.length > 0 && onOpen(item.images, 0)}
    >
      {/* ── 썸네일 ── */}
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {item.images.length > 0 ? (
          <>
            {/* 대표 이미지 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images[0]}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
              style={{
                opacity: hasHoverImage && hovered ? 0 : 1,
                transform: hasHoverImage ? "none" : hovered ? "scale(1.05)" : "scale(1)",
              }}
            />
            {/* 호버 이미지 (2번째) */}
            {hasHoverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.images[1]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: hovered ? 1 : 0 }}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* 호버 이미지 있으면 전환 인디케이터 */}
        {hasHoverImage && (
          <div
            className="absolute bottom-2 left-2 flex gap-1 transition-opacity duration-300"
            style={{ opacity: hovered ? 1 : 0.6 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ background: hovered ? "rgba(255,255,255,0.5)" : "white" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{ background: hovered ? "white" : "rgba(255,255,255,0.5)" }}
            />
          </div>
        )}
      </div>

      {/* ── 정보 ── */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: col.bg, color: col.text }}
          >
            {item.category}
          </span>
          {item.client && (
            <span className="text-xs text-slate-400">{item.client}</span>
          )}
        </div>
        <h3
          className="font-bold text-slate-900 mb-1 transition-colors duration-200"
          style={{ color: hovered ? "#1E22B2" : undefined }}
        >
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
}

/* ─── 메인 갤러리 ─── */
export default function PortfolioGallery({ items, categories }: Props) {
  const [active, setActive] = useState<string>("전체");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const tabs = ["전체", ...categories];
  const filtered = active === "전체" ? items : items.filter((i) => i.category === active);

  function openLightbox(images: string[], index: number) {
    setLightbox({ images, index });
  }

  function closeLightbox() {
    setLightbox(null);
  }

  function prevImage() {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  }

  function nextImage() {
    if (!lightbox) return;
    setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });
  }

  return (
    <>
      {/* ── 카테고리 탭 ── */}
      <div className="flex gap-2 flex-wrap mb-10">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
            style={
              active === tab
                ? { background: "#1E22B2", color: "#fff" }
                : { background: "#fff", color: "#475569", border: "1px solid #E2E8F0" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── 빈 상태 ── */}
      {filtered.length === 0 && (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-slate-500 text-lg">아직 등록된 작품이 없습니다.</p>
          <p className="text-slate-400 text-sm mt-2">곧 멋진 작품들로 채워질 예정입니다!</p>
        </div>
      )}

      {/* ── 그리드 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <PortfolioCard key={item.id} item={item} onOpen={openLightbox} />
        ))}
      </div>

      {/* ── 라이트박스 ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none z-10"
            onClick={closeLightbox}
          >
            ×
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 text-4xl z-10"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 text-4xl z-10"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ background: i === lightbox.index ? "white" : "rgba(255,255,255,0.35)" }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
