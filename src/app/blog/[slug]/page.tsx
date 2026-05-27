import { notFound } from "next/navigation";
import { getPostBySlug, getPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.filter((p) => p.published).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const canonical = `/blog/${post.slug}`;
  return {
    // template 가 자동으로 ` | CES` 를 붙이므로 여기서 다시 붙이지 않음
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonical,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      ...(post.tag ? { tags: [post.tag] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const tagColors: Record<string, string> = {
    "제작 과정": "bg-orange-100 text-orange-700",
    "교육": "bg-blue-100 text-blue-700",
    "이야기": "bg-amber-100 text-amber-700",
    "사례 연구": "bg-purple-100 text-purple-700",
    "소재": "bg-green-100 text-green-700",
    "디자인": "bg-pink-100 text-pink-700",
  };

  // BlogPosting JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: "ko-KR",
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/og-default.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    ...(post.tag ? { articleSection: post.tag } : {}),
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-slate-500 hover:text-orange-600 text-sm mb-8 transition-colors"
      >
        ← 블로그 목록
      </Link>

      <div className="mb-10">
        <span className="text-6xl block mb-6">{post.emoji}</span>
        <div className="flex items-center gap-3 mb-4">
          {post.tag && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                tagColors[post.tag] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {post.tag}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {new Date(post.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-slate-500 leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      <div className="border-t border-slate-200 mb-10" />

      <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-orange-600 prose-img:rounded-xl">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-200">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          ← 다른 글 보기
        </Link>
      </div>
    </article>
  );
}
