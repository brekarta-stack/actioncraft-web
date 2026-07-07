/**
 * /studio/upload/custom?job=<id> — 업로드 전개 결과 꾸미기 (M3+).
 * 카탈로그 꾸미기와 같은 에디터에 잡 결과 파일 URL 만 주입한다.
 * 잡 상태를 한 번 확인해 완료(done)일 때만 에디터를 연다.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import UploadCustomClient from "@/components/UploadCustomClient";

export const metadata: Metadata = {
  title: "내 모델 꾸미기 (베타) — 종이모형 스튜디오",
  robots: { index: false, follow: false },
  // 개인 산출물 페이지 — URL 의 잡 ID(?job=) 가 referrer 로 새지 않게
  referrer: "no-referrer",
};

export default function UploadCustomPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}>
        <UploadCustomClient />
      </Suspense>
    </main>
  );
}
