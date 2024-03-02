import { api } from "@/trpc/server";
import { DeleteAlbum } from "@/components/DeleteAlbum";
import { serverFetch } from "@/lib/utils";
import { Album } from "@/components/Album";

export default async function AlbumView({ params }: { params: { aid: string } }) {
  const ret = await serverFetch(async () => await api.album.get(params.aid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }

  return (
    <>
      <Album aid={params.aid} initAlbum={ret.val} />
      <DeleteAlbum aid={params.aid} />
    </>
  );
}
