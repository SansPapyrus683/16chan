import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";
import { TagPost } from "@/components/TagPost";
import Link from "next/link";
import { sauceUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { CommentInput, CommentList } from "@/components/Comment";
import { notFound } from "next/navigation";

export default async function PostView({ params }: { params: { pid: string } }) {
  let post;
  let error = null;
  try {
    post = await api.post.get(params.pid);
  } catch (e) {
    error = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code == "NOT_FOUND") {
        notFound();
      } else if (e.code === "FORBIDDEN") {
        error = "you aren't authorized to see this post";
      }
    }
  }
  if (!post) {
    return <div>{error}</div>;
  }
  const { userId } = auth();

  const author = post.userId && (await api.user.profileByUid(post.userId));
  const src = sauceUrl(post.src, post.artId);
  return (
    <div className="space-y-4">
      <h1>{post.title}</h1>
      <h2>
        posted by{" "}
        {author ? (
          <Link href={`/account/${author.username}`}>{author.username}</Link>
        ) : (
          "a deleted user"
        )}
      </h2>
      {post.userId == userId && (
        <div>
          <Link href={`/post/${params.pid}/edit`}>edit ur post here</Link>
        </div>
      )}
      <div className="space-y-2">
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
      <div>source: {src ? <Link href={src[1]}>{src[0]}</Link> : "no source."}</div>
      <div>
        tags:{" "}
        {post.tags.length == 0 ? (
          "no tags!"
        ) : (
          <ul>
            {post.tags.map((t) => (
              <li key={t.tagName}>
                {t.tagCat}:{t.tagName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <TagPost pid={params.pid} />
      <AddToAlbum pid={params.pid} />
      <CommentList comments={post.comments} />
      <CommentInput pid={params.pid} />
    </div>
  );
}
