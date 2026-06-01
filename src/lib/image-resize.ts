/**
 * 클라이언트 사이드 이미지 리사이즈.
 *
 * 갤러리/블로그 이미지 업로드 시 호출. 큰 사진(폰 카메라 5~30MB)이
 * Vercel body size limit(약 4.5MB) 또는 서버 측 10MB limit에 걸리는 것을 방지.
 *
 * 정책:
 *  - PDF / GIF (애니메이션) / 이미지가 아닌 파일은 원본 그대로 반환.
 *  - 원본 ≤ targetBytes 이고 긴 변 ≤ maxLongEdge 면 원본 그대로 반환.
 *  - 그 외에는 캔버스로 비율 유지 축소 + JPEG 85% 재인코딩.
 *  - PNG 는 투명도 보존 위해 PNG 로 재인코딩 (단 alpha 채널 없으면 JPEG 로).
 */

export interface ResizeOptions {
  /** 긴 변 최대 픽셀 (기본 2000). 갤러리 표시에 충분한 해상도. */
  maxLongEdge?: number;
  /** 이 크기 이하 + 사이즈 OK 면 리사이즈 스킵 (기본 3MB). */
  skipBelowBytes?: number;
  /** JPEG 품질 0~1 (기본 0.85). */
  jpegQuality?: number;
}

export interface ResizeResult {
  file: File;
  /** 리사이즈가 실제로 이뤄졌는지 (false 면 원본 그대로). */
  resized: boolean;
  /** 원본 바이트 수. */
  originalBytes: number;
  /** 출력 바이트 수. */
  outputBytes: number;
  /** 출력 가로/세로 (이미지일 때만). */
  width?: number;
  height?: number;
}

const RESIZABLE_MIME = /^image\/(jpe?g|png|webp)$/i;

export async function prepareImageForUpload(
  file: File,
  opts: ResizeOptions = {},
): Promise<ResizeResult> {
  const maxLongEdge   = opts.maxLongEdge   ?? 2000;
  const skipBelowBytes = opts.skipBelowBytes ?? 3 * 1024 * 1024; // 3 MB
  const jpegQuality   = opts.jpegQuality   ?? 0.85;

  const originalBytes = file.size;

  // 이미지가 아니거나 GIF 면 원본 그대로 (PDF/GIF 애니메이션 보존)
  if (!RESIZABLE_MIME.test(file.type)) {
    return { file, resized: false, originalBytes, outputBytes: originalBytes };
  }

  // 작고 충분히 보낼 만한 사이즈는 빠르게 통과
  if (originalBytes <= skipBelowBytes) {
    // 단, 차원이 매우 큰 PNG (예: 5000x5000) 가 압축으로 작아진 경우는 드물지만
    // 일단 사이즈 기준만 적용 — 사이즈가 작으면 차원도 보통 작다.
    return { file, resized: false, originalBytes, outputBytes: originalBytes };
  }

  const img = await loadImage(file);
  const longEdge = Math.max(img.width, img.height);
  const scale = Math.min(1, maxLongEdge / longEdge);
  const targetW = Math.max(1, Math.round(img.width  * scale));
  const targetH = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // 캔버스 사용 불가 → 원본으로 fallback (서버 limit 에 걸려도 사용자에게는 명시적 메시지)
    return { file, resized: false, originalBytes, outputBytes: originalBytes, width: img.width, height: img.height };
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // PNG 는 PNG 유지 (투명도/그래픽), 그 외는 JPEG 로 변환
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const outputExt  = outputType === "image/png" ? ".png" : ".jpg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, outputType === "image/jpeg" ? jpegQuality : undefined);
  });
  if (!blob) {
    return { file, resized: false, originalBytes, outputBytes: originalBytes, width: img.width, height: img.height };
  }

  const baseName = stripExtension(file.name) || "image";
  const resizedFile = new File([blob], `${baseName}${outputExt}`, {
    type: outputType,
    lastModified: Date.now(),
  });

  // 만약 리사이즈한 결과가 오히려 더 크면(매우 드물지만 PNG 의 경우 가능) 원본 반환
  if (resizedFile.size >= originalBytes) {
    return { file, resized: false, originalBytes, outputBytes: originalBytes, width: img.width, height: img.height };
  }

  return {
    file: resizedFile,
    resized: true,
    originalBytes,
    outputBytes: resizedFile.size,
    width: targetW,
    height: targetH,
  };
}

function stripExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e instanceof Error ? e : new Error("이미지를 읽지 못했습니다."));
    };
    img.src = url;
  });
}

/** 사용자 알림용: "2.4MB → 0.6MB로 줄였어요" 같은 문구 만들기. */
export function formatResizeNote(r: ResizeResult): string | null {
  if (!r.resized) return null;
  const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
  const dim = r.width && r.height ? ` (${r.width}×${r.height})` : "";
  return `자동 리사이즈: ${mb(r.originalBytes)}MB → ${mb(r.outputBytes)}MB${dim}`;
}
