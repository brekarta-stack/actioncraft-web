import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getItems } from "@/lib/portfolio";
import AdminPortfolioList from "@/components/admin/AdminPortfolioList";

export default async function AdminPortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const items = await getItems();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">제작 사례 관리</h1>
          <p className="text-slate-500 text-sm mt-1">
            {session.user?.email} · {items.length}개의 작품
          </p>
        </div>
        <a
          href="/admin/portfolio/new"
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
        >
          + 작품 등록
        </a>
      </div>
      <AdminPortfolioList initialItems={items} />
    </div>
  );
}
