import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArtistEditor from "@/components/admin/ArtistEditor";

export default async function NewArtistPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return <ArtistEditor />;
}
