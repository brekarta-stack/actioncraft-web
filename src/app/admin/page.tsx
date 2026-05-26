import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/blog";
import { getItems } from "@/lib/portfolio";
import AdminPostList from "@/components/admin/AdminPostList";
import AdminPortfolioList from "@/components/admin/AdminPortfolioList";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const posts = await getPosts();
  const portfolioItems = await getItems();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">관리자 대시보드</h1>
          <p className="text-slate-500 text-sm mt-1">{session.user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-orange-500 mb-1">{posts.length}</div>
          <div className="text-sm text-slate-500">블로그 포스트</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="text-3xl font-bold text-orange-500 mb-1">{portfolioItems.length}</div>
          <div className="text-sm text-slate-500">제작 사례</div>
        </div>
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
