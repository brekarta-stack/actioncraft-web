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
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "종이모형 스튜디오 (베타) — 만들어 볼 종이모형 도안",
  description:
    `자동차·공룡·동물(바다·육지·곤충)·식물·인기 캐릭터·세계 건축물 종이모형 ${STUDIO_ITEMS.length}종. ` +
    "3D로 미리 돌려 보고, 도면을 확인하고, 인쇄용 PDF를 내려받아 바로 만들어 보세요.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: `종이모형 스튜디오 (베타) | ${SITE_NAME}`,
    description: "3D로 미리 보고 인쇄해서 만드는 종이모형 도안.",
    url: "/studio",
    type: "website",
  },
};

/** 목록 구조화 데이터 — CollectionPage + ItemList(전 모형 URL). 카탈로그 색인/GEO용. */
function StudioListJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "종이모형 스튜디오",
    description: `종이공예 도안 ${STUDIO_ITEMS.length}종 — 3D 미리보기와 무료 인쇄 PDF.`,
    url: `${SITE_URL}/studio`,
    inLanguage: "ko-KR",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: STUDIO_ITEMS.length,
      itemListElement: STUDIO_ITEMS.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name_ko,
        url: `${SITE_URL}/studio/${it.skey}`,
      })),
    },
  };
  return (
    <script type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function StudioPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <StudioListJsonLd />
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" style={{ wordBreak: "keep-all" }}>
            종이모형 스튜디오
          </h1>
          <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
            베타
          </span>
        </div>
      </header>

      <StudioCatalog items={STUDIO_ITEMS} />

      <footer className="mt-10 text-xs text-slate-400" style={{ wordBreak: "keep-all" }}>
        도안은 Papercraft Studio 2 엔진이 생성했습니다. 미리보기 도면에는 papercraft.kr
        워터마크가 표시되며, 내려받은 PDF에는 표시되지 않습니다.
      </footer>
    </main>
  );
}
