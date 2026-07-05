/**
 * /studio/[key]/custom — 웹 꾸미기 에디터 (M2 트랙B, 베타).
 * 클린 시트(비공개 자산)를 쓰는 앱성 페이지라 검색엔진 색인 제외.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StudioCustomizer from "@/components/StudioCustomizer";
import { getStudioItem, STUDIO_ITEMS } from "@/lib/studio";

interface Props {
  params: Promise<{ key: string }>;
}

export function generateStaticParams() {
  return STUDIO_ITEMS.map((i) => ({ key: i.skey }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params;
  const item = getStudioItem(key);
  return {
    title: item ? `${item.name_ko} 꾸미기 (베타)` : "꾸미기",
    robots: { index: false, follow: false },
  };
}

export default async function StudioCustomPage({ params }: Props) {
  const { key } = await params;
  const item = getStudioItem(key);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav className="pc-hide-print mb-4 text-sm text-slate-500 flex items-center gap-2">
        <Link href={`/studio/${item.skey}`} className="hover:underline"
              data-track="studio_custom_back">
          ← {item.name_ko}
        </Link>
        <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5">
          꾸미기 베타
        </span>
      </nav>
      <h1 className="pc-hide-print text-2xl font-bold mb-4" style={{ wordBreak: "keep-all" }}>
        {item.name_ko} 꾸미기
      </h1>
      <StudioCustomizer skey={item.skey} name={item.name_ko} sheets={item.svg_sheets} />
    </main>
  );
}
