"use client";

/**
 * 3D 완성 미리보기 — <model-viewer> (드래그 회전·핀치 줌·자동 회전, 터치 내장).
 * 커스텀 엘리먼트 정의는 클라이언트에서만 동적 import (SSR 안전).
 * GLB 는 사전 생성 산출물(최대 ~18KB)이라 저사양 기기에서도 가볍다(M0 스모크 검증).
 */

import { useEffect, useState } from "react";

export default function StudioViewer({ src, alt, poster }: { src: string; alt: string; poster?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    import("@google/model-viewer").then(() => alive && setReady(true))
      .catch(() => alive && setReady(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-[#26282c]">
      {ready ? (
        // 카드 썸네일(thumb.png)과 '동일한 각도·포즈'로 열리도록: poster=썸네일 +
        // 썸네일 렌더 각도(측면 3/4)와 맞춘 camera-orbit + 자동회전 제거(포즈 고정).
        // 자동회전이 모델을 딴 각도로 돌려 "썸네일과 다르다"는 인상을 줬음(사용자 지적).
        <model-viewer
          src={src}
          alt={alt}
          poster={poster}
          loading="eager"
          camera-controls
          camera-orbit="30deg 72deg auto"
          shadow-intensity="0.6"
          exposure="1.05"
          touch-action="pan-y"
          interaction-prompt="none"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          3D 미리보기 불러오는 중…
        </div>
      )}
      <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 pointer-events-none">
        드래그 = 회전 · 휠/핀치 = 확대
      </div>
    </div>
  );
}
