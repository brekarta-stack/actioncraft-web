/**
 * /studio/class — 학급 세트 (교육 패키지, 웹 M4).
 * 교사가 모형×수량을 담아 묶음 인쇄 PDF 와 공유 링크를 만든다.
 * 세트 상태는 전부 URL(items=)에 있어 서버 저장·로그인이 없다.
 * 도구 페이지라 색인은 막는다(카탈로그가 SEO 진입점).
 */

import type { Metadata } from "next";
import Link from "next/link";
import StudioClassBuilder, { type ClassItem } from "@/components/StudioClassBuilder";
import { STUDIO_ITEMS, studioAsset } from "@/lib/studio";

export const metadata: Metadata = {
  title: "학급 세트 만들기 (베타) — 종이모형 스튜디오",
  description:
    "모형과 수량을 담으면 반 전체 분량의 묶음 인쇄 PDF와 수업 공유 링크를 만들어 드립니다.",
  robots: { index: false, follow: false },
};

export default function StudioClassPage() {
  const items: ClassItem[] = STUDIO_ITEMS.map((i) => ({
    skey: i.skey,
    name_ko: i.name_ko,
    category: i.category,
    pdf_pages: i.pdf_pages,
    stars: i.stars,
    est_minutes: i.est_minutes,
    thumb: studioAsset(i.skey, "thumb.png"),
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/studio" className="hover:underline" data-track="studio_class_back">
          ← 종이모형 스튜디오
        </Link>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" style={{ wordBreak: "keep-all" }}>
            학급 세트 만들기
          </h1>
          <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
            베타
          </span>
        </div>
        <p className="mt-3 text-slate-600" style={{ wordBreak: "keep-all" }}>
          수업에 쓸 모형과 수량을 담으세요.
          <br />
          반 전체 분량을 한 파일로 인쇄하고, 링크 하나로 학생들과 공유할 수 있어요.
        </p>
      </header>

      <StudioClassBuilder items={items} />
    </main>
  );
}
