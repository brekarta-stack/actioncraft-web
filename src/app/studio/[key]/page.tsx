/**
 * /studio/[key] — 종이모형 상세: 3D 미리보기 · 도면(워터마크 SVG) · PDF 다운로드.
 * 데이터는 사전 생성 index.json 하나 — 서버 계산 없음. PDF 는 비공개 폴더에서
 * /api/studio/pdf/[key] 라우트가 서빙(베타=무료, 유료 전환은 환경변수 스위치).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import StudioViewer from "@/components/StudioViewer";
import StudioSheets from "@/components/StudioSheets";
import StudioClassAdd from "@/components/StudioClassAdd";
import { getStudioItem, starsLabel, studioAsset, STUDIO_ITEMS, STUDIO_PAPER } from "@/lib/studio";
import { SITE_NAME } from "@/lib/site";

interface Props {
  params: Promise<{ key: string }>;
}

export function generateStaticParams() {
  return STUDIO_ITEMS.map((i) => ({ key: i.skey }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const item = getStudioItem(key);
  if (!item) {
    return { title: "종이모형을 찾을 수 없습니다", robots: { index: false, follow: false } };
  }
  const title = `${item.name_ko} 종이모형 도안`;
  const description =
    `${item.name_ko} 종이모형 — 조각 ${item.pieces}개, ${STUDIO_PAPER} ${item.pages}장, ` +
    `완성 약 ${Math.round(item.finished_mm)}mm. 3D로 미리 보고 인쇄용 PDF로 만들어 보세요.`;
  return {
    title,
    description,
    alternates: { canonical: `/studio/${item.skey}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `/studio/${item.skey}`,
      type: "website",
      images: [{ url: studioAsset(item.skey, "thumb.png"), width: 480, height: 480 }],
    },
  };
}

export default async function StudioDetailPage({ params }: Props) {
  const { key } = await params;
  const item = getStudioItem(key);
  if (!item) notFound();

  // LCP = 도면 1쪽 SVG — HTML 파싱 시점에 페치가 시작되게 서버에서 preload 힌트
  // (클라이언트 컴포넌트 마운트를 기다리면 콜드 엣지에서 로드가 늦는다)
  preload(studioAsset(item.skey, "preview_p1.svg"), { as: "image", fetchPriority: "high" });

  const assetBase = studioAsset(item.skey, "").replace(/\/$/, "");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/studio" className="hover:underline" data-track="studio_back_to_list">
          ← 종이모형 스튜디오
        </Link>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <StudioViewer src={studioAsset(item.skey, "model.glb")} alt={`${item.name_ko} 3D 미리보기`} />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold" style={{ wordBreak: "keep-all" }}>
              {item.name_ko}
            </h1>
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
              베타
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-slate-500">조각 수</dt>
              <dd className="font-semibold tabular-nums">{item.pieces}개</dd>
            </div>
            <div>
              <dt className="text-slate-500">인쇄 장수</dt>
              <dd className="font-semibold tabular-nums">
                {STUDIO_PAPER} {item.pdf_pages}장
                <span className="ml-1 text-xs font-normal text-slate-400">조립 안내 포함</span>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">완성 크기</dt>
              <dd className="font-semibold tabular-nums">약 {Math.round(item.finished_mm)}mm</dd>
            </div>
            <div>
              <dt className="text-slate-500">난이도</dt>
              <dd className="font-semibold text-amber-500">{starsLabel(item.stars)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">예상 시간</dt>
              <dd className="font-semibold tabular-nums">약 {item.est_minutes}분</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`/api/studio/pdf/${item.skey}`}
              data-track={`studio_pdf:${item.skey}`}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--pe-blue,#1a73e8)] px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              인쇄용 PDF 내려받기
            </a>
            <Link
              href={`/studio/${item.skey}/custom`}
              data-track={`studio_custom:${item.skey}`}
              className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--pe-blue,#1a73e8)] px-6 py-3 text-[var(--pe-blue,#1a73e8)] font-semibold hover:bg-blue-50 transition-colors"
            >
              웹에서 꾸미기 (베타)
            </Link>
            <StudioClassAdd skey={item.skey} />
          </div>
          <p className="mt-2 text-xs text-slate-500" style={{ wordBreak: "keep-all" }}>
            베타 기간 무료 · 실제 크기(100%)로 인쇄하세요. 실선은 자르고, 점선은 접고,
            같은 번호끼리 풀로 붙입니다. 꾸미기에서는 색칠·글자·로고를 얹어 바로 인쇄할 수 있어요.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600"
               style={{ wordBreak: "keep-all" }}>
            크기 조절·색칠·내 3D 모델 전개 같은 편집은{" "}
            <Link href="/download" className="underline underline-offset-2"
                  data-track="studio_detail_to_download">
              데스크톱 앱
            </Link>
            에서 할 수 있어요.
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4" style={{ wordBreak: "keep-all" }}>
          도면 미리보기
          <span className="ml-2 align-middle text-xs font-normal text-slate-400">
            워터마크는 내려받은 PDF에는 없습니다
          </span>
        </h2>
        <StudioSheets base={assetBase} sheets={item.svg_sheets} name={item.name_ko} />
      </section>
    </main>
  );
}
