/**
 * 업로드 전개(M3) 순수 헬퍼 — 서버 라우트와 node --test 가 공유한다.
 * (supabase/env 의존이 없어 테스트에서 그대로 import 가능)
 */

/** 웹에서 받는 3D 형식 — 엔진 SUPPORTED 의 부분집합(희귀 포맷은 베타 제외). */
export const UPLOAD_EXTS = [".stl", ".obj", ".ply", ".glb", ".gltf"];

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel 요청 한도(4.5MB) 안쪽
export const RATE_LIMIT_PER_DAY = 10;
export const RESULT_TTL_DAYS = 7;

/** 결과 파일명 화이트리스트 — 워커가 올릴 수 있는 것과 브라우저가 받을 수 있는 것의 전부. */
export const RESULT_NAME_RE =
  /^(meta\.json|net\.json|model\.glb|print\.pdf|(?:preview|sheet)_p\d{1,2}\.svg)$/;

export const JOB_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CTYPES = {
  ".json": "application/json",
  ".glb": "model/gltf-binary",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/** @param {string} name */
export function contentTypeFor(name) {
  const dot = name.lastIndexOf(".");
  return CTYPES[name.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

/** 업로드 원본 파일명을 스토리지 키로 안전화 (경로조작·유니코드 제어문자 차단). */
export function sanitizeUploadName(name) {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  if (!UPLOAD_EXTS.includes(ext)) return null;
  const stem = (dot >= 0 ? name.slice(0, dot) : name)
    .replace(/[^0-9A-Za-z가-힣 _-]/g, "")
    .trim()
    .slice(0, 40);
  return (stem || "model") + ext;
}

/** meta.svg_sheets 로 done 결과의 파일 목록을 구성 (status 응답용). */
export function resultFileNames(svgSheets) {
  const n = Math.max(0, Math.min(99, Number(svgSheets) || 0));
  const names = ["meta.json", "net.json", "model.glb", "print.pdf"];
  for (let i = 1; i <= n; i++) names.push(`preview_p${i}.svg`, `sheet_p${i}.svg`);
  return names;
}
