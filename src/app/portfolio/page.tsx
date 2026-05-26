import type { Metadata } from "next";
import { getItems, CATEGORIES } from "@/lib/portfolio";
import PortfolioGallery from "@/components/PortfolioGallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "제작 사례 | Craft Engineering Studio",
  description: "팝업북, 페이퍼 크래프트, 액션 크래프트, 우드락 등 CES의 다양한 제작 사례를 확인하세요.",
};

export default async function PortfolioPage() {
  const items = (await getItems()).filter((i) => i.published);

  return (
    <>
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

