import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BlogEditor from "@/components/admin/BlogEditor";

export default async function NewPostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return <BlogEditor />;
}
