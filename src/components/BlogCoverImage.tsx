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
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** CSS object-position 값. 기본: "center 25%" (얼굴·핵심 피사체 보존) */
  objectPosition?: string;
  fallback: ReactNode;
  /** LCP(블로그 상세 커버)면 true → preload·즉시 디코드. 카드(목록)는 기본 false. */
  priority?: boolean;
  /** next/image sizes — 렌더 폭에 맞는 소스 선택. 기본은 카드 격자 기준. */
  sizes?: string;
}

export function BlogCoverImage({
  src,
  alt,
  className,
  objectPosition = "center 25%",
  fallback,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  // fill 로 부모 박스를 채우고 object-cover 로 크롭한다. 부모는 aspect/height + relative 가
  // 필요하므로, 호출부 className(aspect-[16/7]·h-full 등)을 wrapper 에 적용하고 relative 를 보강.
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition }}
        onError={() => setFailed(true)}
        priority={priority}
      />
    </div>
  );
}
