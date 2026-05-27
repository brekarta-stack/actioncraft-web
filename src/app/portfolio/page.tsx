import type { Metadata } from "next";
import { getItems, CATEGORIES } from "@/lib/portfolio";
import PortfolioGallery from "@/components/PortfolioGallery";
import { PAGE_META, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: PAGE_META.portfolio.title,
  description: PAGE_META.portfolio.description,
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: PAGE_META.portfolio.title,
    description: PAGE_META.portfolio.description,
    url: "/portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_META.portfolio.title,
    description: PAGE_META.portfolio.description,
  },
};

/**
 * 포트폴리오 페이지 ItemList / CreativeWork JSON-LD.
 * 검색엔진이 어떤 사례들을 다루는지 파악하도록 ItemList 로 묶음.
 */
function PortfolioJsonLd({ items }: { items: { title: string; slug?: string; description?: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CES 제작 사례",
    url: `${SITE_URL}/portfolio`,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 30).map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "CreativeWork",
        name: item.title,
        creator: { "@type": "Organization", name: SITE_NAME },
        ...(item.description ? { description: item.description } : {}),
        ...(item.slug ? { url: `${SITE_URL}/portfolio#${item.slug}` } : {}),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PortfolioPage() {
  const items = (await getItems()).filter((i) => i.published);

  return (
    <>
      <PortfolioJsonLd items={items} />
      {/* Hero */}
      <section className="py-20 md:py-28" style={{ background: "#1E22B2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full mb-6">
            Portfolio
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">제작 사례</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            팝업북부터 액션 크래프트까지, CES가 만들어온 작품들을 소개합니다.
          </p>
        </div>
      </section>

      {/* Gallery with filter */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioGallery items={items} categories={[...CATEGORIES]} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            비슷한 제품을 제작하고 싶으신가요?
          </h2>
          <p className="text-orange-100 mb-6">
            무료 견적을 통해 원하시는 제품의 제작 가능 여부와 비용을 확인해보세요.
          </p>
          <a
            href="/quote"
            className="inline-block px-8 py-3.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors"
          >
            무료 견적 받기
          </a>
        </div>
      </section>
    </>
  );
}

