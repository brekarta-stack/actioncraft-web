"use client";

import { useEffect, useState } from "react";

/**
 * 현재 브라우저의 '집계 제외' 상태 표시/토글.
 * instrumentation-client.ts 와 동일한 localStorage 키(pc_notrack)를 사용한다.
 * /admin 에 들어오면 수집 클라이언트가 자동으로 제외 플래그를 켜므로,
 * 운영자 본인 방문은 기본적으로 집계되지 않는다. (이 버튼으로 직접 켜고 끌 수 있음)
 */
const NOTRACK_KEY = "pc_notrack";

export default function NoTrackToggle() {
  const [excluded, setExcluded] = useState<boolean | null>(null);

  useEffect(() => {
    let v = false;
    try {
      v = localStorage.getItem(NOTRACK_KEY) === "1";
    } catch {
      v = false;
    }
    // localStorage 는 클라이언트에서만 읽히므로 마운트 후 1회 설정 (하이드레이션 안전)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExcluded(v);
  }, []);

  function toggle() {
    try {
      const next = localStorage.getItem(NOTRACK_KEY) !== "1";
      if (next) localStorage.setItem(NOTRACK_KEY, "1");
      else localStorage.removeItem(NOTRACK_KEY);
      setExcluded(next);
    } catch {
      /* noop */
    }
  }

  if (excluded === null) return null;

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          excluded ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
        }`}
        title="이 브라우저의 방문이 분석 집계에 포함되는지 여부"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${excluded ? "bg-emerald-500" : "bg-slate-400"}`} />
        {excluded ? "내 방문 집계 제외됨" : "내 방문 집계 중"}
      </span>
      <button
        type="button"
        onClick={toggle}
        className="text-[11px] text-slate-400 hover:text-slate-600 underline underline-offset-2"
      >
        {excluded ? "이 브라우저 집계 다시 켜기" : "이 브라우저 집계에서 제외"}
      </button>
    </div>
  );
}
