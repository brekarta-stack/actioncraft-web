/**
 * /studio/upload — 내 3D 모델을 올려 종이 전개도로 (웹 M3, 조용한 베타).
 * 전개는 워커가 하고 이 페이지는 큐 상태만 폴링한다. 개인 파일을 다루는
 * 도구 페이지라 검색 색인은 막는다.
 */

import type { Metadata } from "next";
import Link from "next/link";
import StudioUpload from "@/components/StudioUpload";

export const metadata: Metadata = {
  title: "내 3D 모델 전개 (베타) — 종이모형 스튜디오",
  description:
    "STL·OBJ·GLB 등 내 3D 모델을 올리면 종이로 만들 수 있는 전개도(PDF)로 바꿔 드립니다.",
  robots: { index: false, follow: false },
};

export default function StudioUploadPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/studio" className="hover:underline" data-track="studio_upload_back">
          ← 종이모형 스튜디오
        </Link>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold" style={{ wordBreak: "keep-all" }}>
            내 3D 모델 전개
          </h1>
          <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1">
            베타
          </span>
        </div>
        <p className="mt-3 text-slate-600" style={{ wordBreak: "keep-all" }}>
          갖고 있는 3D 모델을 올리면 종이로 만들 수 있는 전개도로 바꿔 드립니다.
          <br />
          복잡한 모델은 손으로 만들 수 있게 면 수를 자동으로 줄입니다.
        </p>
      </header>

      <StudioUpload />

      <footer className="mt-10 text-xs text-slate-400" style={{ wordBreak: "keep-all" }}>
        크기 조절·색칠·조각 편집까지 하려면{" "}
        <Link href="/download" className="underline underline-offset-2"
              data-track="studio_upload_to_download">
          데스크톱 앱(Papercraft Studio 2)
        </Link>
        을 받아 보세요.
      </footer>
    </main>
  );
}
