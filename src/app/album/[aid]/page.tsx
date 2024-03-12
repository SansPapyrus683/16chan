import { api } from "@/trpc/server";
import { DeleteAlbum } from "@/components/DeleteAlbum";
import { serialize, serverFetch } from "@/lib/utils";
import { Album } from "@/components/Album";

export default async function AlbumView({ params }: { params: { aid: string } }) {
  const ret = await serverFetch(async () => await api.album.get(params.aid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }

  return (
    <div className="space-y-4">
      <Album aid={params.aid} initAlbum={serialize(ret.val)} />
      <DeleteAlbum aid={params.aid} />
    </div>
  );
}
