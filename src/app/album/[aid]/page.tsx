import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";

export default async function AlbumView({ params }: { params: { aid: string } }) {
  let album,
    error = null;
  try {
    album = await api.album.get(params.aid);
  } catch (e) {
    error = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code == "NOT_FOUND") {
        error = "this post wasn't found";
      } else if (e.code === "UNAUTHORIZED") {
        error = "you ar en't authorized to see this post";
      }
    }
  }

  return error ? (
    <div>{error}</div>
  ) : (
    <>
      <h1>{album!.name}</h1>
      <ol>
        {album!.posts.map((p) => (
          <li key={p.id}>
            <a href={`/post/${p.id}`}>{p.title}</a> | {p.id}
          </li>
        ))}
      </ol>
    </>
  );
}
