import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import path from "path";

/* ── 허용 MIME 타입 + 최대 크기 ── */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

// MIME → 허용 확장자 매핑
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  "image/jpeg":      [".jpg", ".jpeg"],
  "image/png":       [".png"],
  "image/webp":      [".webp"],
  "image/gif":       [".gif"],
  "application/pdf": [".pdf"],
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  /* ── 인증 확인 ── */
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  /* ── 크기 검증 ── */
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
  }

  /* ── MIME 타입 검증 ── */
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "허용되지 않는 파일 형식입니다. (jpg, png, webp, gif, pdf만 가능)" },
      { status: 400 }
    );
  }

  /* ── 파일 확장자와 MIME 타입 일치 여부 검증 ── */
  const ext = path.extname(file.name).toLowerCase();
  const allowedExts = ALLOWED_EXTENSIONS[file.type] ?? [];
  if (ext && !allowedExts.includes(ext)) {
    return NextResponse.json(
      { error: "파일 확장자와 형식이 일치하지 않습니다." },
      { status: 400 }
    );
  }

  const safeExt = allowedExts[0] ?? ".bin";
  const filename = `${randomUUID()}${safeExt}`;

  /* ── 매직 바이트 검증 (이미지 위변조 방지) ── */
  const bytes = await file.arrayBuffer();
  const header = new Uint8Array(bytes.slice(0, 8));

  if (file.type === "image/jpeg" && !(header[0] === 0xff && header[1] === 0xd8)) {
    return NextResponse.json({ error: "잘못된 JPEG 파일입니다." }, { status: 400 });
  }
  if (
    file.type === "image/png" &&
    !(header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47)
  ) {
    return NextResponse.json({ error: "잘못된 PNG 파일입니다." }, { status: 400 });
  }

  /* ── Supabase Storage 업로드 ── */
  const buffer = Buffer.from(bytes);
  const { error } = await supabase.storage
    .from("uploads")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[api/upload] storage error:", error);
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
