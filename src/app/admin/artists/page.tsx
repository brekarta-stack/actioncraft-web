import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllArtists } from "@/lib/artists";
import AdminArtistList from "@/components/admin/AdminArtistList";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { artists, source } = await getAllArtists();
  return <AdminArtistList initialItems={artists} source={source} />;
}
