import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { getItems } from "@/lib/portfolio";
import { deriveSlug } from "@/lib/portfolio-meta";
import { SITE_URL } from "@/lib/site";
import { STUDIO_ITEMS } from "@/lib/studio";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  // 정적 페이지 신선도 신호 — 배포 시각 기준(크롤러 재방문 효율).
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/about`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/products`, lastModified: now, priority: 0.9, changeFrequency: "monthly" },
    { url: `${base}/portfolio`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/blog`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/quote`, lastModified: now, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/faq`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/download`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/legal/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/legal/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
  ];

  const allPosts = await getPosts().catch(() => []);
  const blogPages: MetadataRoute.Sitemap = allPosts
    .filter((p) => p.published)
    .map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.7,
      changeFrequency: "monthly" as const,
    }));

  // 종이모형 스튜디오 — 목록+상세 125페이지는 색인 허용(도구 페이지
  // upload/class/custom 은 noindex 라 제외). 네이버는 사이트맵 등록 URL 만
  // 성실히 수집하므로 여기 빠지면 발견이 크게 늦는다.
  const studioPages: MetadataRoute.Sitemap = [
    { url: `${base}/studio`, lastModified: now, priority: 0.9, changeFrequency: "weekly" as const },
    ...STUDIO_ITEMS.map((i) => ({
      url: `${base}/studio/${i.skey}`,
      lastModified: now,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
  ];

  const allCases = await getItems().catch(() => []);
  const portfolioPages: MetadataRoute.Sitemap = allCases
    .filter((c) => c.published)
    .map((c) => ({
      url: `${base}/portfolio/${deriveSlug(c)}`,
      lastModified: new Date(c.updatedAt),
      priority: 0.8,
      changeFrequency: "monthly" as const,
    }));

  return [...staticPages, ...studioPages, ...blogPages, ...portfolioPages];
}
