import { api } from "@/trpc/server";
import { DeleteAlbum } from "@/components/DeleteAlbum";
import { PostList } from "@/components/PostList";
import { serverFetch } from "@/lib/utils";

export default async function AlbumView({ params }: { params: { aid: string } }) {
  const ret = await serverFetch(async () => await api.album.get(params.aid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const album = ret.val;

  return (
    <>
      <h1>{album!.name}</h1>
      <PostList posts={album!.posts.map((p) => p.post)} likeButton />
      <DeleteAlbum aid={params.aid} />
    </>
  );
}
