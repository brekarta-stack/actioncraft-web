"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/lib/blog";

const TAGS = ["제작 과정", "교육", "이야기", "사례 연구", "소재", "디자인"];

/* ── 폴리네이션 AI 이미지 URL 생성 ── */
function pollinationsUrl(prompt: string, w = 1200, h = 630, seed?: number): string {
  const params = new URLSearchParams({
    width: String(w),
    height: String(h),
    nologo: "true",
    model: "flux",
    enhance: "true",
    ...(seed != null ? { seed: String(seed) } : {}),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
}

/* ──────────────────────────────────────
 * 툴바 버튼
 * ────────────────────────────────────── */
function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors select-none ${
        active
          ? "bg-blue-100 text-[#1E22B2]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────
 * 이미지 삽입 패널 (업로드 | AI 생성 | URL)
 * ────────────────────────────────────── */
function ImagePanel({
  onInsert,
  onClose,
  title = "이미지 삽입",
}: {
  onInsert: (url: string, alt?: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const [tab, setTab] = useState<"upload" | "ai" | "url">("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [previewUrl, setPreviewUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  function generatePreview() {
    if (!aiPrompt.trim()) return;
    const url = pollinationsUrl(aiPrompt.trim(), 1200, 630, aiSeed);
    setGenerating(true);
    setPreviewUrl(url);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("업로드 실패");
      const { url } = await res.json();
      onInsert(url, file.name);
    } catch {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="absolute z-30 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl w-80 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg mb-4">
        {(["ai", "upload", "url"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "ai" ? "🤖 AI 생성" : t === "upload" ? "📁 업로드" : "🔗 URL"}
          </button>
        ))}
      </div>

      {/* AI 생성 탭 */}
      {tab === "ai" && (
        <div className="space-y-3">
          <div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={"예: 어린이들이 종이 팝업북 만드는 체험\n교실에서 학생들이 페이퍼토이 조립"}
              rows={3}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) generatePreview(); }}
            />
            <p className="text-[11px] text-slate-400 mt-1">⌘Enter로 생성</p>
          </div>

          <button
            type="button"
            onClick={generatePreview}
            disabled={!aiPrompt.trim()}
            className="w-full py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: "#1E22B2" }}
          >
            이미지 생성
          </button>

          {previewUrl && (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="AI generated"
                className="w-full aspect-video object-cover rounded-xl border border-slate-200"
                onLoad={() => setGenerating(false)}
                onError={() => setGenerating(false)}
              />
              {generating && (
                <p className="text-xs text-slate-400 text-center">생성 중…</p>
              )}
              {!generating && (
                <button
                  type="button"
                  onClick={() => onInsert(previewUrl, aiPrompt)}
                  className="w-full py-2 text-sm font-semibold rounded-xl border border-blue-200 text-[#1E22B2] hover:bg-blue-50 transition-colors"
                >
                  이 이미지 사용
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 업로드 탭 */}
      {tab === "upload" && (
        <label className="cursor-pointer block">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            ) : (
              <>
                <div className="text-2xl mb-2">📁</div>
                <p className="text-sm text-slate-600 font-medium">파일 선택</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · 최대 10MB</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {/* URL 탭 */}
      {tab === "url" && (
        <div className="space-y-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://..."
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
            onKeyDown={(e) => { if (e.key === "Enter" && urlInput) onInsert(urlInput); }}
          />
          <button
            type="button"
            onClick={() => urlInput && onInsert(urlInput)}
            disabled={!urlInput}
            className="w-full py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: "#1E22B2" }}
          >
            삽입
          </button>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────
 * 커버 이미지 영역
 * ────────────────────────────────────── */
function CoverImageSection({
  coverImage,
  onChange,
}: {
  coverImage: string;
  onChange: (url: string) => void;
}) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5">
      {coverImage ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt="커버 이미지"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-end justify-end p-3 gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPanel((v) => !v)}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold rounded-lg shadow transition-colors"
              >
                교체
              </button>
              {showPanel && (
                <ImagePanel
                  title="커버 이미지 교체"
                  onInsert={(url) => { onChange(url); setShowPanel(false); }}
                  onClose={() => setShowPanel(false)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              제거
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">커버 이미지</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPanel((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-[#1E22B2] transition-colors"
            >
              <span>＋ 이미지 추가</span>
            </button>
            {showPanel && (
              <ImagePanel
                title="커버 이미지 설정"
                onInsert={(url) => { onChange(url); setShowPanel(false); }}
                onClose={() => setShowPanel(false)}
              />
            )}
          </div>
          <span className="text-xs text-slate-400">블로그 목록 및 포스트 상단에 표시됩니다</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────
 * 에디터 툴바
 * ────────────────────────────────────── */
function Toolbar({ editor }: { editor: Editor }) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImagePanel, setShowImagePanel] = useState(false);

  function applyLink() {
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl("");
    setShowLinkInput(false);
  }

  function insertImage(url: string, alt?: string) {
    editor.chain().focus().setImage({ src: url, alt: alt ?? "" }).run();
    setShowImagePanel(false);
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
      {/* 제목 */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목2">
        <span className="font-bold text-xs">H2</span>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목3">
        <span className="font-bold text-xs">H3</span>
      </Btn>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* 텍스트 서식 */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게 (Ctrl+B)">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M3.5 2h4a3 3 0 012 5.24A3.5 3.5 0 017.5 14H3.5a1 1 0 01-1-1V3a1 1 0 011-1zm1.5 5h2a1.5 1.5 0 000-3H5v3zm0 5h2.5a1.5 1.5 0 000-3H5v3z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임 (Ctrl+I)">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M6 2.75a.75.75 0 01.75-.75h5a.75.75 0 010 1.5H10.5l-3 8H9a.75.75 0 010 1.5H4a.75.75 0 010-1.5h1.5l3-8H7A.75.75 0 016 3a.75.75 0 010-.25z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄 (Ctrl+U)">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 2a.75.75 0 01.75.75V7a3.25 3.25 0 006.5 0V2.75a.75.75 0 011.5 0V7a4.75 4.75 0 01-9.5 0V2.75A.75.75 0 013 2zm-1 11.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.5 8.75a.75.75 0 000 1.5h11a.75.75 0 000-1.5h-11zM6 4a2 2 0 013.41 1.41l.06.09H11a3.25 3.25 0 00-6.24-1.24L4.5 4a2 2 0 011.5-.97V4zM5.5 12a1.5 1.5 0 003 0H10a2.75 2.75 0 01-5 0H5.5z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="형광펜">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M11.5 1.5l3 3-6.5 7-3.5.5.5-3.5 6.5-7zm-9 11h10a.5.5 0 010 1h-10a.5.5 0 010-1z"/></svg>
      </Btn>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* 블록 */}
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용구">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M1.5 3h13a.5.5 0 010 1h-13a.5.5 0 010-1zm0 4h8a.5.5 0 010 1h-8a.5.5 0 010-1zm0 4h5a.5.5 0 010 1h-5a.5.5 0 010-1z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리 기호">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M2 4a1 1 0 100-2 1 1 0 000 2zm3-1.5h8a.5.5 0 010 1H5a.5.5 0 010-1zm0 5h8a.5.5 0 010 1H5a.5.5 0 010-1zM2 9a1 1 0 100-2 1 1 0 000 2zm3 3.5h8a.5.5 0 010 1H5a.5.5 0 010-1zm-3 .5a1 1 0 100-2 1 1 0 000 2z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호 목록">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M1.5 3h.75V1.5H1.5a.5.5 0 000 1zm1.25.5a.5.5 0 000-1H1.5v1h1.25zM1 6h1.5a.5.5 0 000-1h-1a.5.5 0 000 1zm.5 4.5H1a.5.5 0 010-1h1a.5.5 0 010 1H1.5zM4.5 3h8a.5.5 0 000-1h-8a.5.5 0 000 1zm0 5h8a.5.5 0 000-1h-8a.5.5 0 000 1zm0 5h8a.5.5 0 000-1h-8a.5.5 0 000 1z"/></svg>
      </Btn>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* 코드 */}
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="인라인 코드">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M4.78 4.22a.75.75 0 010 1.06L2.56 7.5l2.22 2.22a.75.75 0 01-1.06 1.06l-2.75-2.75a.75.75 0 010-1.06L3.72 4.22a.75.75 0 011.06 0zm6.44 0a.75.75 0 011.06 0l2.75 2.75a.75.75 0 010 1.06l-2.75 2.75a.75.75 0 11-1.06-1.06L13.44 7.5l-2.22-2.22a.75.75 0 010-1.06zm-3.35 7.98l2-10a.75.75 0 011.47.3l-2 10a.75.75 0 11-1.47-.3z"/></svg>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드 블록">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M1.5 3.5a.5.5 0 01.5-.5h12a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H2a.5.5 0 01-.5-.5v-9zM2 4v8h12V4H2zm2.5 1.5a.5.5 0 01.707 0l2 2a.5.5 0 010 .707l-2 2a.5.5 0 01-.707-.707L6.293 7.5 4.5 5.707A.5.5 0 014.5 5zm4 3a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z"/></svg>
      </Btn>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* 링크 */}
      {showLinkInput ? (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            placeholder="https://"
            className="text-xs px-2 py-1 border border-slate-200 rounded-lg w-36 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
          <button type="button" onMouseDown={applyLink} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium">확인</button>
          <button type="button" onMouseDown={() => { setShowLinkInput(false); setLinkUrl(""); }} className="text-xs text-slate-400 hover:text-slate-600">취소</button>
        </div>
      ) : (
        <Btn
          onClick={() => {
            if (editor.isActive("link")) editor.chain().focus().unsetLink().run();
            else { setLinkUrl(editor.getAttributes("link").href ?? ""); setShowLinkInput(true); }
          }}
          active={editor.isActive("link")}
          title="링크"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.78 4.22a.75.75 0 010 1.06L7.56 7.5l2.22 2.22a.75.75 0 01-1.06 1.06l-2.75-2.75a.75.75 0 010-1.06L8.72 4.22a.75.75 0 011.06 0zM13.5 4a2.5 2.5 0 010 5h-2a.75.75 0 010-1.5h2a1 1 0 000-2H11a.75.75 0 010-1.5h2.5zM5 7.25H3a1 1 0 000 2h2a.75.75 0 010 1.5H3a2.5 2.5 0 010-5h2a.75.75 0 010 1.5z"/></svg>
        </Btn>
      )}

      {/* 이미지 */}
      <div className="relative">
        <Btn onClick={() => setShowImagePanel((v) => !v)} title="이미지 삽입" active={showImagePanel}>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM3.5 3a.5.5 0 00-.5.5v5.19l2.47-2.47a.75.75 0 011.06 0L8.5 8.19l1.47-1.47a.75.75 0 011.06 0L13 8.69V3.5a.5.5 0 00-.5-.5h-9zm-1 9.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-1.31l-2.5-2.5-1.47 1.47a.75.75 0 01-1.06 0L6 8.69 3.5 11.19V12.5zM6 6.5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>
        </Btn>
        {showImagePanel && (
          <ImagePanel
            onInsert={insertImage}
            onClose={() => setShowImagePanel(false)}
          />
        )}
      </div>

      {/* 구분선 */}
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M1.5 8a.5.5 0 01.5-.5h12a.5.5 0 010 1H2a.5.5 0 01-.5-.5z"/></svg>
      </Btn>
    </div>
  );
}

/* ──────────────────────────────────────
 * 메인 BlogEditor
 * ────────────────────────────────────── */
interface Props { post?: Post; }

export default function BlogEditor({ post }: Props) {
  const router = useRouter();
  const [title, setTitle]       = useState(post?.title ?? "");
  const [excerpt, setExcerpt]   = useState(post?.excerpt ?? "");
  const [tag, setTag]           = useState(post?.tag ?? TAGS[0]);
  const [published, setPublished] = useState(post?.published ?? false);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [saving, setSaving]     = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "내용을 여기에 작성하세요…" }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
    ],
    content: post?.content ?? "",
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none",
      },
    },
  });

  const handleSave = useCallback(
    async (pub?: boolean) => {
      if (!editor) return;
      setSaving(true);
      const isPublished = pub !== undefined ? pub : published;
      try {
        const body = {
          title,
          excerpt,
          content: editor.getHTML(),
          tag,
          emoji: "",               // 이모지 대신 커버 이미지 사용
          coverImage: coverImage || undefined,
          published: isPublished,
        };
        const res = post
          ? await fetch(`/api/blog/${post.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
          : await fetch("/api/blog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
        if (!res.ok) throw new Error("저장 실패");
        router.push("/admin/blog");
        router.refresh();
      } catch {
        alert("저장 중 오류가 발생했습니다.");
      } finally {
        setSaving(false);
      }
    },
    [title, excerpt, tag, published, coverImage, editor, post, router]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-slate-500 hover:text-slate-700 text-sm"
        >
          ← 목록으로
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            임시저장
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 text-white font-semibold rounded-lg text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#1E22B2" }}
          >
            {saving ? "저장 중…" : "발행하기"}
          </button>
        </div>
      </div>

      {/* 커버 이미지 */}
      <CoverImageSection coverImage={coverImage} onChange={setCoverImage} />

      {/* 메타 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="블로그 제목을 입력하세요"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg font-semibold"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">요약</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="목록에 표시되는 짧은 설명 (1-2문장)"
            rows={2}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 block mb-1">태그</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-2.5">
            <div
              onClick={() => setPublished((v) => !v)}
              className="w-10 h-6 rounded-full transition-colors relative cursor-pointer"
              style={{ background: published ? "#1E22B2" : "#e2e8f0" }}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${published ? "left-5" : "left-1"}`} />
            </div>
            <span className="text-sm text-slate-700 font-medium">공개</span>
          </label>
        </div>
      </div>

      {/* WYSIWYG 에디터 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {editor && <Toolbar editor={editor} />}
        <div className="tiptap-editor" onClick={() => editor?.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Ctrl+B 굵게 · Ctrl+I 기울임 · Ctrl+Z 실행취소 · 이미지는 드래그&드롭 또는 툴바 버튼으로 삽입
      </p>
    </div>
  );
}
