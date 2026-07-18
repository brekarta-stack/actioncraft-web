import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getArtistById } from "@/lib/artists";
import ArtistEditor from "@/components/admin/ArtistEditor";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) notFound();

  return <ArtistEditor artist={artist} />;
}
