import { api } from "@/trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";
import { TagPost } from "@/components/TagPost";
import Link from "next/link";
import { sauceUrl, serverFetch } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { CommentInput, CommentList } from "@/components/Comment";

export default async function PostView({ params }: { params: { pid: string } }) {
  const ret = await serverFetch(async () => await api.post.get(params.pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val;

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
            src={u.rawImg}
            alt={`picture number ${ind + 1}`}
            width={200}
            height={200}
            priority
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
