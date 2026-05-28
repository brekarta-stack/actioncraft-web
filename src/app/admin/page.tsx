import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/blog";
import { getItems } from "@/lib/portfolio";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminPostList from "@/components/admin/AdminPostList";
import AdminPortfolioList from "@/components/admin/AdminPortfolioList";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const posts = await getPosts();
  const portfolioItems = await getItems();
  const { count: quoteCount } = await supabaseAdmin
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .then((r) => ({ count: r.count ?? 0 }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <p className="text-slate-500 text-sm mt-1">{session.user?.email}</p>
        </div>
        <Link
          href="/admin/setup"
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          🛠 DB 셋업
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-orange-500 mb-1">{posts.length}</div>
          <div className="text-sm text-slate-500">블로그 포스트</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-orange-500 mb-1">{portfolioItems.length}</div>
          <div className="text-sm text-slate-500">제작 사례</div>
        </div>
        <Link
          href="/admin/quotes"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="text-3xl font-bold mb-1 group-hover:text-blue-600" style={{ color: "#1E22B2" }}>
            {quoteCount}
          </div>
          <div className="text-sm text-slate-500 group-hover:text-blue-500">견적 문의 →</div>
        </Link>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">블로그 관리</h2>
          <a
            href="/admin/blog/new"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + 새 글 쓰기
          </a>
        </div>
        <AdminPostList initialPosts={posts} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">제작 사례 관리</h2>
          <a
            href="/admin/portfolio/new"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + 작품 등록
          </a>
        </div>
        <AdminPortfolioList initialItems={portfolioItems} />
      </div>
    </div>
  );
}
