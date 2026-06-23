import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 생성형 AI(LLM) 검색·학습 크롤러 — 검색 답변에 인용되도록 명시적으로 허용한다 (GEO).
 * (관리/내부 API 경로는 일반 봇과 동일하게 차단)
 */
const AI_BOTS = [
  "GPTBot", // OpenAI 학습
  "OAI-SearchBot", // ChatGPT Search
  "ChatGPT-User", // ChatGPT 브라우징
  "ClaudeBot", // Anthropic 학습
  "Claude-User", // Claude 브라우징
  "anthropic-ai", // Anthropic
  "PerplexityBot", // Perplexity 색인
  "Perplexity-User", // Perplexity 브라우징
  "Google-Extended", // Google Gemini / AI Overviews
  "Applebot-Extended", // Apple Intelligence
  "CCBot", // Common Crawl (다수 LLM 학습 데이터)
];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin/", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
