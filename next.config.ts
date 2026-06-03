import type { NextConfig } from "next";

/**
 * Supabase host — 환경변수에서 추출 (없으면 알려진 호스트로 fallback).
 * NEXT_PUBLIC_SUPABASE_URL 은 빌드 시 inline 되므로 클라이언트 코드에서도 동일.
 */
const SUPABASE_HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) return "syrfoqwvsciicfbeemqv.supabase.co";
  try {
    return new URL(url).host;
  } catch {
    return "syrfoqwvsciicfbeemqv.supabase.co";
  }
})();

const IS_PROD = process.env.NODE_ENV === "production";

/**
 * HTTP 보안 헤더
 * - X-Frame-Options: 클릭재킹 방지
 * - X-Content-Type-Options: MIME 스니핑 방지
 * - Referrer-Policy: 외부 이동 시 referrer 제한
 * - Content-Security-Policy: XSS / 인라인 스크립트 제한
 * - Strict-Transport-Security: HTTPS 강제 (Vercel 이 자체 설정하지만 명시)
 *
 * 프로덕션에서는 'unsafe-eval' 제외 (Next.js dev/turbopack 용도만 필요).
 */
const scriptSrc = IS_PROD
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options",        value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      // Tailwind 인라인 스타일
      "style-src 'self' 'unsafe-inline'",
      // Supabase Storage + Wikimedia Commons (파트너 로고) + 정부/박물관 도메인 + Unsplash CDN (블로그 커버) + data/blob
      `img-src 'self' data: blob: https://${SUPABASE_HOST} https://upload.wikimedia.org https://images.unsplash.com https://image.pollinations.ai`,
      // Supabase API + Google OAuth
      `connect-src 'self' https://${SUPABASE_HOST} https://accounts.google.com https://oauth2.googleapis.com`,
      // 폰트
      "font-src 'self' data:",
      // iframe 완전 차단
      "frame-src 'none'",
      "frame-ancestors 'none'",
      // <object> / <embed> 차단
      "object-src 'none'",
      // base tag href 제한
      "base-uri 'self'",
      // form action 제한
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
