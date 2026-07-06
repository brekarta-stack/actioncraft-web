/**
 * /studio — 종이모형 스튜디오 카탈로그 (조용한 베타, 로드맵 M1→M2 트랙A)
 *
 * 사전 생성 산출물(index.json)만 읽는 완전 정적 페이지 — 서버 계산 0.
 * 검색·분류·난이도 필터는 클라이언트(StudioCatalog)에서 즉시 처리(요청 없음).
 */

import type { Metadata } from "next";
import Link from "next/link";
import StudioCatalog from "@/components/StudioCatalog";
import { STUDIO_ITEMS } from "@/lib/studio";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "종이모형 스튜디오 (베타) — 만들어 볼 종이모형 도안",
  description:
    `자동차·동물·공룡·세계 건축물 종이모형 ${STUDIO_ITEMS.length}종. ` +
    "3D로 미리 돌려 보고, 도면을 확인하고, 인쇄용 PDF를 내려받아 바로 만들어 보세요.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: `종이모형 스튜디오 (베타) | ${SITE_NAME}`,
    description: "3D로 미리 보고 인쇄해서 만드는 종이모형 도안.",
    url: "/studio",
    type: "website",
  },
};

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" style={{ wordBreak: "keep-all" }}>
            종이모형 스튜디오
          </h1>
          <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
            베타
          </span>
        </div>
        <p className="mt-3 text-slate-600" style={{ wordBreak: "keep-all" }}>
          3D로 미리 돌려 보고, 도면을 확인하고, 인쇄해서 바로 만들어 보세요.
          <br />
          베타 기간에는 인쇄용 PDF를 무료로 받을 수 있습니다.
        </p>
        <p className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/studio/upload"
            data-track="studio_to_upload"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--pe-blue,#1a73e8)] px-4 py-2 text-sm font-semibold text-[var(--pe-blue,#1a73e8)] hover:bg-blue-50"
          >
            ⬆ 내 3D 모델 올려서 전개하기 (베타)
          </Link>
          <Link
            href="/studio/class"
            data-track="studio_to_class"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            🏫 학급 세트 만들기 — 선생님용 (베타)
          </Link>
        </p>
        <p className="mt-2 text-sm text-slate-500" style={{ wordBreak: "keep-all" }}>
          도면 편집까지 하려면{" "}
          <Link href="/download" className="underline underline-offset-2" data-track="studio_to_download">
            데스크톱 앱(Papercraft Studio 2)
          </Link>
          을 받아 보세요.
        </p>
      </header>

      <StudioCatalog items={STUDIO_ITEMS} />

      <footer className="mt-10 text-xs text-slate-400" style={{ wordBreak: "keep-all" }}>
        도안은 Papercraft Studio 2 엔진이 생성했습니다. 미리보기 도면에는 papercraft.kr
        워터마크가 표시되며, 내려받은 PDF에는 표시되지 않습니다.
      </footer>
    </main>
  );
}
