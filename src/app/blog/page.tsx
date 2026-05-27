import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/blog";
import { PAGE_META } from "@/lib/site";

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
      <section className="py-20 md:py-28" style={{ background: "#1E22B2" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded-full mb-6">
            Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            CES 블로그
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            제작 과정, 교육 활용 사례, 종이공예 이야기를 담았습니다.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-slate-500 text-lg">아직 작성된 글이 없습니다.</p>
              <p className="text-slate-400 text-sm mt-2">곧 흥미로운 글로 찾아오겠습니다!</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              <div className="mb-10">
                <Link
                  href={`/blog/${allPosts[0].slug}`}
                  className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <div
                    className={`bg-gradient-to-br ${tagGradients[allPosts[0].tag] ?? "from-slate-100 to-slate-50"} flex items-center justify-center h-64 md:h-auto`}
                  >
                    <span className="text-8xl group-hover:scale-110 transition-transform">
                      {allPosts[0].emoji}
                    </span>
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">
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
                      <div
                        className={`bg-gradient-to-br ${tagGradients[post.tag] ?? "from-slate-100 to-slate-50"} h-44 flex items-center justify-center`}
                      >
                        <span className="text-6xl group-hover:scale-110 transition-transform">
                          {post.emoji}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 self-start ${
                            tagColors[post.tag] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {post.tag}
                        </span>
                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1">
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

      {/* Newsletter CTA */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">새 글 알림 받기</h2>
          <p className="text-slate-500 mb-6">
            새로운 블로그 포스트가 올라오면 이메일로 알려드립니다.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="이메일 주소를 입력해주세요"
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-900 bg-white"
            />
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors whitespace-nowrap">
              구독
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

