"use client";

/**
 * BlogCoverImage — 이미지 로드 실패 시 fallback으로 자동 전환
 * blog/page.tsx 와 blog/[slug]/page.tsx 에서 사용
 */
import { useState } from "react";
import type { ReactNode } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}

export function BlogCoverImage({ src, alt, className, fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
