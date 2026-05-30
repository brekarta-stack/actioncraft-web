"use client";

/**
 * BlogCoverImage — 이미지 로드 실패 시 fallback으로 자동 전환
 *
 * object-fit: cover + objectPosition으로 핵심 피사체 유지:
 * - 기본값 "center 25%": 인물 사진에서 얼굴(상단)이 크롭 범위 내에 오도록
 * - 가로 크롭(블로그 카드) 시 하단보다 상단을 더 많이 보존
 */
import { useState } from "react";
import type { ReactNode } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** CSS object-position 값. 기본: "center 25%" (얼굴·핵심 피사체 보존) */
  objectPosition?: string;
  fallback: ReactNode;
}

export function BlogCoverImage({
  src,
  alt,
  className,
  objectPosition = "center 25%",
  fallback,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectPosition }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
