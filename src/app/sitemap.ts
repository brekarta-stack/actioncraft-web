import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/products`, priority: 0.9, changeFrequency: "monthly" },
    { url: `${base}/portfolio`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/blog`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/quote`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/faq`, priority: 0.7, changeFrequency: "monthly" },
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

  return [...staticPages, ...blogPages];
}
