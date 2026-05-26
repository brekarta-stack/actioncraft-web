import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getItemById } from "@/lib/portfolio";
import PortfolioEditor from "@/components/admin/PortfolioEditor";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const item = await getItemById(id);
  if (!item) notFound();

  return <PortfolioEditor item={item} />;
}
