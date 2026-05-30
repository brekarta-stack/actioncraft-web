import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/blog";
import { PAGE_META, SITE_SHORT, BRAND_TAGLINE_KR } from "@/lib/site";
import { PencilIcon, ArrowRightIcon } from "@/components/icons";
import { PaperNetBg, BlogThumbnail, blogVariantFromTag } from "@/components/paper-art";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: PAGE_META.blog.title,
  description: PAGE_META.blog.description,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: PAGE_META.blog.title,
    description: PAGE_META.blog.description,
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_META.blog.title,
    description: PAGE_META.blog.description,
  },
};

const tagColors: Record<string, string> = {
  "제작 과정": "bg-orange-100 text-orange-700",
  "교육": "bg-blue-100 text-blue-700",
  "이야기": "bg-amber-100 text-amber-700",
  "사례 연구": "bg-purple-100 text-purple-700",
  "소재": "bg-green-100 text-green-700",
  "디자인": "bg-pink-100 text-pink-700",
};

const tagGradients: Record<string, string> = {
  "제작 과정": "from-orange-100 to-orange-50",
  "교육": "from-blue-100 to-blue-50",
  "이야기": "from-amber-100 to-amber-50",
  "사례 연구": "from-purple-100 to-purple-50",
  "소재": "from-green-100 to-green-50",
  "디자인": "from-pink-100 to-pink-50",
};

export default async function BlogPage() {
  const allPosts = (await getPosts()).filter((p) => p.published);

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: "#1E22B2" }}>
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute -right-32 top-1/4 w-[70%] max-w-3xl rotate-6">
            <PaperNetBg className="w-full h-auto" />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full mb-6 bg-white/10 text-white border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Blog · {BRAND_TAGLINE_KR}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            {SITE_SHORT} <span className="pe-gradient-text">블로그</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto" style={{ wordBreak: "keep-all" }}>
            페이퍼 엔지니어링 제작 과정, STEAM 교육 활용 사례, 종이공예 이야기를 담았습니다.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 text-white" style={{ background: "#1E22B2" }} aria-hidden>
                <PencilIcon size={32} />
              </div>
              <p className="text-slate-700 text-lg font-semibold">아직 작성된 글이 없습니다.</p>
              <p className="text-slate-400 text-sm mt-2">곧 페이퍼 엔지니어링 관련 콘텐츠로 찾아오겠습니다.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              <div className="mb-10">
                <Link
                  href={`/blog/${allPosts[0].slug}`}
                  className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-64 md:h-auto md:min-h-[280px] group-hover:scale-[1.02] transition-transform overflow-hidden">
                    {allPosts[0].coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={allPosts[0].coverImage} alt={allPosts[0].title} className="w-full h-full object-cover" />
                    ) : allPosts[0].emoji ? (
                      <div className={`bg-gradient-to-br ${tagGradients[allPosts[0].tag] ?? "from-slate-100 to-slate-50"} flex items-center justify-center h-full`}>
                        <span className="text-8xl">{allPosts[0].emoji}</span>
                      </div>
                    ) : (
                      <BlogThumbnail variant={blogVariantFromTag(allPosts[0].tag)} className="w-full h-full" />
                    )}
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      {allPosts[0].tag && (
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            tagColors[allPosts[0].tag] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {allPosts[0].tag}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                        추천 글
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#1E22B2] transition-colors">
                      {allPosts[0].title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-6">{allPosts[0].excerpt}</p>
                    <div className="text-sm text-slate-400">
                      {new Date(allPosts[0].createdAt).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </Link>
              </div>

              {/* Post Grid */}
              {allPosts.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPosts.slice(1).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <div className="h-44 overflow-hidden group-hover:scale-[1.02] transition-transform">
                        {post.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                        ) : post.emoji ? (
                          <div className={`bg-gradient-to-br ${tagGradients[post.tag] ?? "from-slate-100 to-slate-50"} h-full flex items-center justify-center`}>
                            <span className="text-6xl">{post.emoji}</span>
                          </div>
                        ) : (
                          <BlogThumbnail variant={blogVariantFromTag(post.tag)} className="w-full h-full" />
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 self-start ${
                            tagColors[post.tag] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {post.tag}
                        </span>
                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[#1E22B2] transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
                        <div className="text-xs text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20" style={{ background: "#F0F2FF" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
            페이퍼 엔지니어링 프로젝트를 시작해볼까요?
          </h2>
          <p className="text-slate-500 mb-8" style={{ wordBreak: "keep-all" }}>
            블로그에서 본 사례 같은 작업을 의뢰하고 싶으시다면, 자동 견적으로 빠르게 문의해 주세요.
          </p>
          <Link
            href="/quote"
            className="group inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl text-white text-lg shadow-lg shadow-pink-500/25 hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #06C6C8, #E91E8C)" }}
          >
            무료 견적 받기
            <ArrowRightIcon size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </>
  );
}

