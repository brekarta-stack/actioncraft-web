import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPostById } from "@/lib/blog";
import BlogEditor from "@/components/admin/BlogEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <BlogEditor post={post} />;
}
