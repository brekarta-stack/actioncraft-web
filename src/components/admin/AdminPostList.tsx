"use client";

import { useState } from "react";
import type { Post } from "@/lib/blog";

export default function AdminPostList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);

  async function deletePost(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-slate-500">아직 작성된 글이 없습니다.</p>
        <a
          href="/admin/blog/new"
          className="inline-block mt-4 px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          첫 글 쓰기
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
        >
          <span className="text-2xl">{post.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
              {post.published ? (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex-shrink-0">
                  공개
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex-shrink-0">
                  비공개
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {post.tag} · {new Date(post.updatedAt).toLocaleDateString("ko-KR")}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href={`/admin/blog/${post.id}/edit`}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
            >
              편집
            </a>
            <button
              onClick={() => deletePost(post.id)}
              className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
