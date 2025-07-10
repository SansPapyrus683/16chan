import { api } from "@/trpc/server";
import { DeleteAlbum } from "@/components/DeleteAlbum";
import { serialize, serverFetch } from "@/lib/utils";
import { Album } from "@/components/Album";
import { auth } from "@clerk/nextjs/server";

export default async function AlbumView({
  params,
}: {
  params: Promise<{ aid: string }>;
}) {
  const aid = (await params).aid;
  const ret = await serverFetch(async () => await api.album.get(aid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const { userId } = await auth();

  return (
    <div className="space-y-4">
      <Album aid={aid} initAlbum={serialize(ret.val)} />
      {userId == ret.val!.userId && <DeleteAlbum aid={aid} />}
    </div>
  );
}
