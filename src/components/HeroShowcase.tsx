"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 히어로 우측 쇼케이스 — 실제 스튜디오 쇼룸 사진을 부드러운 cross-fade 로 순환.
 *
 * - 자동 전환(5s) · 마우스 올리면 일시정지 · prefers-reduced-motion 존중
 * - 사진은 라운드 프레임 + 미세 링/그림자로 '쇼케이스 윈도우'처럼 프레이밍
 */

type Slide = { src: string; alt: string };

const SLIDES: Slide[] = [
  {
    src: "/home/studio-1.jpg",
    alt: "PE Studio 쇼룸 — 직접 설계해 만든 페이퍼 모형 전시 진열장",
  },
  {
    src: "/about/studio-2.jpg",
    alt: "PE Studio 쇼룸 — 13년간 축적한 페이퍼 모형 아카이브",
  },
];

const INTERVAL_MS = 5000;

export default function HeroShowcase({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const pausedRef = useRef(false);

  // 모션 최소화 설정 존중
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // 자동 전환 (호버 시 일시정지)
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActive((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== active}
        >
          <figure className="relative w-full h-full rounded-[28px] overflow-hidden ring-1 ring-white/15 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {/* 인디고 히어로 톤과 어울리는 하단 그라데이션 (깊이 + 인디케이터 가독성) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(30,34,178,0.72) 0%, rgba(30,34,178,0.08) 36%, rgba(30,34,178,0) 58%)",
              }}
            />
          </figure>
        </div>
      ))}

      {/* 슬라이드 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${i + 1}번째 비주얼 보기`}
            className="group p-1.5"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-white" : "w-1.5 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
