/**
 * Next.js 16 Edge Proxy — /admin/** 경로를 Edge에서 인증 보호
 *
 * next-auth v4 withAuth:
 * - 세션이 없으면 pages.signIn(/admin/login)으로 리다이렉트
 * - /admin/login 자체는 matcher에서 제외하여 무한 루프 방지
 */
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  // /admin/login 을 제외한 모든 /admin/** 경로 보호
  matcher: ["/admin/((?!login$|login/).*)"],
};
