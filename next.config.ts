import type { NextConfig } from "next";

const SUPABASE_HOST = "syrfoqwvsciicfbeemqv.supabase.co";

/**
 * HTTP 보안 헤더
 * - X-Frame-Options: 클릭재킹 방지
 * - X-Content-Type-Options: MIME 스니핑 방지
 * - Referrer-Policy: 외부 이동 시 referrer 제한
 * - Content-Security-Policy: XSS / 인라인 스크립트 제한
 */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js 인라인 스크립트 / turbopack dev 필요
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind 인라인 스타일
      "style-src 'self' 'unsafe-inline'",
      // Supabase Storage + Wikimedia Commons + Pollinations AI + Picsum (블로그 커버) + data/blob
      `img-src 'self' data: blob: https://${SUPABASE_HOST} https://upload.wikimedia.org https://image.pollinations.ai https://fastly.picsum.photos https://picsum.photos`,
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
