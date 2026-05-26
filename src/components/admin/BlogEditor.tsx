"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/blog";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const TAGS = ["제작 과정", "교육", "이야기", "사례 연구", "소재", "디자인"];
const EMOJIS = ["⚙️", "📐", "📜", "🏢", "🌿", "🔺", "📝", "🎨", "✏️", "🎪"];

interface Props {
  post?: Post;
}

export default function BlogEditor({ post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tag, setTag] = useState(post?.tag ?? TAGS[0]);
  const [emoji, setEmoji] = useState(post?.emoji ?? "📝");
  const [published, setPublished] = useState(post?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = useCallback(
    async (pub?: boolean) => {
      setSaving(true);
      const isPublished = pub !== undefined ? pub : published;

      try {
        const body = { title, excerpt, content, tag, emoji, published: isPublished };
        let res: Response;

        if (post) {
          res = await fetch(`/api/blog/${post.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } else {
          res = await fetch("/api/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }

        if (!res.ok) throw new Error("저장 실패");
        router.push("/admin");
        router.refresh();
      } catch (e) {
        alert("저장 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setSaving(false);
      }
    },
    [title, excerpt, content, tag, emoji, published, post, router]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("업로드 실패");
        const { url } = await res.json();
        const imageMarkdown = `\n![${file.name}](${url})\n`;
        setContent((prev) => prev + imageMarkdown);
      } catch (e) {
        alert("이미지 업로드 중 오류가 발생했습니다.");
        console.error(e);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    []
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" data-color-mode="light">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/admin")}
          className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1"
        >
          ← 목록으로
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            임시저장
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "저장 중…" : "발행하기"}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-4">
        {/* Emoji picker */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">이모지</label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-2xl w-10 h-10 rounded-lg border-2 transition-colors ${
                  emoji === e
                    ? "border-orange-400 bg-orange-50"
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="블로그 제목을 입력하세요"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">요약</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="블로그 목록에 표시될 짧은 요약을 입력하세요"
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

        {/* Tag + Published */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 block mb-1">태그</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-2.5">
            <div
              onClick={() => setPublished((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                published ? "bg-orange-500" : "bg-slate-200"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                  published ? "left-5" : "left-1"
                }`}
              />
            </div>
            <span className="text-sm text-slate-700 font-medium">공개</span>
          </label>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            {uploading ? "업로드 중…" : "🖼️ 이미지 삽입"}
          </div>
          <span className="text-xs text-slate-400">
            이미지를 업로드하면 에디터 끝에 마크다운으로 삽입됩니다.
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Editor */}
      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <MDEditor
          value={content}
          onChange={(v) => setContent(v ?? "")}
          height={500}
          preview="live"
        />
      </div>
    </div>
  );
}
