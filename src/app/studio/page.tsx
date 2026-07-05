/**
 * /studio — 종이모형 스튜디오 카탈로그 (조용한 베타, 로드맵 M1)
 *
 * 사전 생성 산출물(index.json)만 읽는 완전 정적 페이지 — 서버 계산 0.
 * 카드 → /studio/[key] 상세 (3D 미리보기 · 도면 · PDF 다운로드).
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { itemsByCategory, starsLabel, studioAsset, STUDIO_ITEMS } from "@/lib/studio";
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
  const groups = itemsByCategory();
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10">
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
        <p className="mt-2 text-sm text-slate-500" style={{ wordBreak: "keep-all" }}>
          내 3D 모델 전개·도면 편집까지 하려면{" "}
          <Link href="/download" className="underline underline-offset-2" data-track="studio_to_download">
            데스크톱 앱(Papercraft Studio 2)
          </Link>
          을 받아 보세요.
        </p>
      </header>

      {groups.map(({ category, items }) => (
        <section key={category} className="mb-12">
          <h2 className="text-xl font-bold mb-4" style={{ wordBreak: "keep-all" }}>
            {category}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((it) => (
              <Link
                key={it.skey}
                href={`/studio/${it.skey}`}
                className="pe-paper-lift group block rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition-shadow"
                aria-label={`${it.name_ko} 종이모형 — 상세 보기`}
              >
                <div className="relative aspect-square bg-[#26282c]">
                  <Image
                    src={studioAsset(it.skey, "thumb.png")}
                    alt={`${it.name_ko} 종이모형 3D 미리보기`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <div className="font-semibold" style={{ wordBreak: "keep-all" }}>
                    {it.name_ko}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    조각 {it.pieces} · A4 {it.pages}장 ·{" "}
                    <span className="text-amber-500" aria-label={`난이도 ${it.stars}단계`}>
                      {starsLabel(it.stars)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-4 text-xs text-slate-400" style={{ wordBreak: "keep-all" }}>
        도안은 Papercraft Studio 2 엔진이 생성했습니다. 미리보기 도면에는 papercraft.kr
        워터마크가 표시되며, 내려받은 PDF에는 표시되지 않습니다.
      </footer>
    </main>
  );
}
