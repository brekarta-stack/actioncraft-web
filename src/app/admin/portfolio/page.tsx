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
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">납품 사례</h1>
          <p className="text-slate-500 text-sm mt-0.5">총 {items.length}개</p>
        </div>
        <a
          href="/admin/portfolio/new"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
          style={{ background: "#1E22B2" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          작품 등록
        </a>
      </div>
      <AdminPortfolioList initialItems={items} />
    </div>
  );
}
