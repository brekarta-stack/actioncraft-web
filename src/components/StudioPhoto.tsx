"use client";

import { useState } from "react";

/**
 * 회사소개 스튜디오 사진 — public/about/ 의 정적 이미지.
 * 파일이 아직 없으면(404) 깨진 이미지 아이콘 대신 아무것도 렌더하지 않는다.
 * (해당 경로에 이미지 파일을 넣으면 자동으로 표시됨)
 */
export default function StudioPhoto({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-auto rounded-2xl border border-slate-200 shadow-sm"
      />
      {caption && (
        <figcaption
          className="text-center text-xs text-slate-400 mt-2.5"
          style={{ wordBreak: "keep-all" }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
