import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function PostView({
  params,
}: {
  params: { pid: string };
}) {
  let post;
  try {
    post = await api.post.get(params.pid);
  } catch (e) {
    if (e instanceof TRPCError && e.code == "NOT_FOUND") {
      return notFound();
    } else {
      return <div>something screwed up</div>;
    }
  }

  return (
    <>
      <h1>{post.title}</h1>
      <div>
        {post.images.map((u, ind) => (
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
    </>
  );
}
