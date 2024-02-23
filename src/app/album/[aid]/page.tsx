import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { DeleteAlbum } from "@/components/DeleteAlbum";
import { PostList } from "@/components/PostList";

export default async function AlbumView({ params }: { params: { aid: string } }) {
  let album;
  let error = null;
  try {
    album = await api.album.get(params.aid);
  } catch (e) {
    error = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code == "NOT_FOUND") {
        error = "this post wasn't found";
      } else if (e.code === "FORBIDDEN") {
        error = "you aren't authorized to see this post";
      }
    }
  }

  return !album ? (
    <div>{error}</div>
  ) : (
    <>
      <h1>{album!.name}</h1>
      <PostList posts={album!.posts.map((p) => p.post)} likeButton />
      <DeleteAlbum aid={params.aid} />
    </>
  );
}
