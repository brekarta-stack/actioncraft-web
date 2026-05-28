import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/blog";
import AdminPostList from "@/components/admin/AdminPostList";
import Link from "next/link";

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const posts = await getPosts();
  const published = posts.filter((p) => p.published);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">블로그</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            전체 {posts.length}건 · 공개 {published.length}건 · 비공개 {posts.length - published.length}건
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
          style={{ background: "#1E22B2" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          새 글 쓰기
        </Link>
      </div>

      <AdminPostList initialPosts={posts} />
    </div>
  );
}
