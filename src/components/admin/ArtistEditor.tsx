"use client";

/**
 * 아티스트 등록/편집 폼 — /admin/artists/new, /admin/artists/[id]/edit
 *
 * 프로필 사진은 /api/upload (Supabase Storage) 로 올리고 URL 만 저장.
 * portfolioTag 는 비워두면 이름과 동일하게 저장된다 (납품 사례 태그와 매칭).
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Artist } from "@/lib/artist-types";
import { prepareImageForUpload, formatResizeNote } from "@/lib/image-resize";

interface Props {
  artist?: Artist;
}

/** 쉼표/Enter 로 추가하는 칩 목록 입력 */
function ChipListInput({
  label, hint, chips, onChange, placeholder, accent = "#1E22B2",
}: {
  label: string;
  hint?: string;
  chips: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  accent?: string;
}) {
  const [input, setInput] = useState("");

  function add(raw: string) {
    const v = raw.trim().replace(/,+$/, "");
    if (!v || chips.includes(v)) return;
    onChange([...chips, v]);
  }

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 block mb-1">
        {label} {hint && <span className="text-slate-400 font-normal">({hint})</span>}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {chips.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
            style={{ background: `${accent}14`, color: accent }}
          >
            {c}
            <button
              type="button"
              onClick={() => onChange(chips.filter((x) => x !== c))}
              className="opacity-60 hover:opacity-100 ml-0.5"
              aria-label={`${c} 삭제`}
            >
              ×
            </button>
          </span>
        ))}
        {chips.length === 0 && <span className="text-xs text-slate-400">아직 없음</span>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
              setInput("");
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={() => { add(input); setInput(""); }}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 font-medium"
        >
          추가
        </button>
      </div>
    </div>
  );
}

export default function ArtistEditor({ artist }: Props) {
  const router = useRouter();
  const [name, setName] = useState(artist?.name ?? "");
  const [englishName, setEnglishName] = useState(artist?.englishName ?? "");
  const [role, setRole] = useState(artist?.role ?? "");
  const [photo, setPhoto] = useState(artist?.photo ?? "");
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [specialties, setSpecialties] = useState<string[]>(artist?.specialties ?? []);
  const [styleTags, setStyleTags] = useState<string[]>(artist?.styleTags ?? []);
  const [career, setCareer] = useState<string[]>(artist?.career ?? []);
  const [portfolioTag, setPortfolioTag] = useState(artist?.portfolioTag ?? "");
  const [links, setLinks] = useState<{ label: string; url: string }[]>(
    artist?.links?.length ? artist.links : [{ label: "", url: "" }]
  );
  const [published, setPublished] = useState(artist?.published ?? true);
  const [sortOrder, setSortOrder] = useState<number>(artist?.sortOrder ?? 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resizeNote, setResizeNote] = useState<string | null>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResizeNote(null);
    try {
      const prepared = await prepareImageForUpload(file);
      const fd = new FormData();
      fd.append("file", prepared.file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(res.status === 413 ? "파일이 너무 큽니다." : "업로드 실패");
      const { url } = await res.json();
      setPhoto(url);
      const note = formatResizeNote(prepared);
      if (note) setResizeNote(note);
    } catch (err) {
      alert(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name,
        englishName: englishName || undefined,
        role,
        photo: photo || undefined,
        bio,
        specialties,
        styleTags,
        career,
        portfolioTag: portfolioTag || name,
        links: links.filter((l) => l.url.trim()),
        published,
        sortOrder,
      };
      const res = artist
        ? await fetch(`/api/artists/${artist.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/artists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "저장 실패");
      }
      router.push("/admin/artists");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [name, englishName, role, photo, bio, specialties, styleTags, career, portfolioTag, links, published, sortOrder, artist, router]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/artists")}
          className="text-slate-500 hover:text-slate-700 text-sm"
        >
          ← 목록으로
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-white font-semibold rounded-lg text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "#1E22B2" }}
        >
          {saving ? "저장 중…" : "저장하기"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* 프로필 사진 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">프로필 사진</label>
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={`${name || "아티스트"} 프로필`} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold"
                  style={{ background: "linear-gradient(135deg, #06C6C8, #1E22B2)" }}
                >
                  {name.charAt(0) || "?"}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-block cursor-pointer px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#1E22B2] transition-colors">
                {photo ? "사진 교체" : "사진 업로드"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="block text-xs text-red-500 hover:text-red-600"
                >
                  사진 제거
                </button>
              )}
              <p className="text-[11px] text-slate-400" style={{ wordBreak: "keep-all" }}>
                정사각형 권장 · 큰 사진은 자동 리사이즈됩니다.
                {resizeNote && <span className="block text-emerald-600">{resizeNote}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* 이름 + 영문명 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김지호"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              영문 표기 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder="예: Jiho Kim"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* 직함 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">직함 / 전문 분야 한 줄</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="예: 페이퍼 엔지니어 · 지기구조 설계"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* 소개 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            소개 <span className="text-slate-400 font-normal">(2~3문장)</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="어떤 작업을 하는지, 무엇이 강점인지 소개해 주세요."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
          />
        </div>

        {/* 칩 입력들 */}
        <ChipListInput
          label="전문 영역"
          hint="카드에 체크 리스트로 노출"
          chips={specialties}
          onChange={setSpecialties}
          placeholder="예: 지기구조 설계 — Enter 로 추가"
          accent="#06C6C8"
        />
        <ChipListInput
          label="작업 스타일 태그"
          hint="프로필 사진 위 칩 오버레이"
          chips={styleTags}
          onChange={setStyleTags}
          placeholder="예: 캐릭터라이즈 — Enter 로 추가"
          accent="#E91E8C"
        />
        <ChipListInput
          label="주요 이력"
          hint="최대 3개 노출"
          chips={career}
          onChange={setCareer}
          placeholder="예: 지자체 캐릭터 페이퍼토이 다수 — Enter 로 추가"
          accent="#F5C518"
        />

        {/* 외부 링크 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            외부 포트폴리오 / SNS 링크 <span className="text-slate-400 font-normal">(선택)</span>
          </label>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={l.label}
                  onChange={(e) =>
                    setLinks((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="라벨 (예: Behance)"
                  className="w-36 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="url"
                  value={l.url}
                  onChange={(e) =>
                    setLinks((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))
                  }
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="button"
                  onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                  className="px-2.5 text-slate-400 hover:text-red-500"
                  aria-label="링크 삭제"
                >
                  ×
                </button>
              </div>
            ))}
            {links.length < 4 && (
              <button
                type="button"
                onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-[#1E22B2] transition-colors"
              >
                + 링크 추가
              </button>
            )}
          </div>
        </div>

        {/* 작품 연결 태그 */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            작품 연결 태그 <span className="text-slate-400 font-normal">(비워두면 이름과 동일)</span>
          </label>
          <input
            type="text"
            value={portfolioTag}
            onChange={(e) => setPortfolioTag(e.target.value)}
            placeholder={name || "예: 김지호"}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-[11px] text-slate-400 mt-1" style={{ wordBreak: "keep-all" }}>
            납품 사례에 이 태그를 붙이면 회사소개의 &lsquo;이 아티스트 작품 보기&rsquo; 결과로 노출됩니다.
            태그를 바꾸면 기존 작품의 태그도 함께 바꿔야 합니다.
          </p>
        </div>

        {/* 노출 순서 + 공개 토글 */}
        <div className="flex items-end gap-6 flex-wrap">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              노출 순서 <span className="text-slate-400 font-normal">(작을수록 앞)</span>
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-28 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 pe-num"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer pb-2.5">
            <div
              onClick={() => setPublished((v) => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${published ? "" : "bg-slate-200"}`}
              style={published ? { background: "#1E22B2" } : {}}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${published ? "left-5" : "left-1"}`}
              />
            </div>
            <span className="text-sm text-slate-700 font-medium">회사소개에 노출</span>
          </label>
        </div>
      </div>
    </div>
  );
}
