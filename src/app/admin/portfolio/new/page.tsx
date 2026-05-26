import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PortfolioEditor from "@/components/admin/PortfolioEditor";

export default async function NewPortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return <PortfolioEditor />;
}
