import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";

export default async function PostView({ params }: { params: { pid: string } }) {
  let post,
    error = null;
  try {
    post = await api.post.get(params.pid);
  } catch (e) {
    error = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code == "NOT_FOUND") {
        error = "this post wasn't found";
      } else if (e.code === "UNAUTHORIZED") {
        error = "you aren't authorized to see this post";
      }
    }
  }

  return error ? (
    <div>{error}</div>
  ) : (
    <>
      <h1>{post!.title}</h1>
      <div>
        {post!.images.map((u, ind) => (
          <Image
            key={u.id}
            className="w-auto"
            src={u.img}
            alt={`picture number ${ind + 1}`}
            width={200}
            height={200}
          />
        ))}
      </div>
      <div>
        <a href={`/post/${params.pid}/edit`}>edit ur post here</a>
      </div>
      <div>
        <AddToAlbum pid={params.pid} />
      </div>
    </>
  );
}
