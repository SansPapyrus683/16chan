import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { serverFetch } from "@/lib/utils";

export default async function userLikes({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ cursor: string | string[] | undefined }>;
}) {
  const p = await params;
  const sp = await searchParams;

  const ret = await serverFetch(
    async () => await api.user.profileByUsername(p.handle),
  );
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const profile = ret.val;

  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const likes = await api.user.userLikes({ user: profile.id, cursor });
  return (
    <>
      <h1>{profile.username}'s likes</h1>
      <div>
        <PaginatedPostList
          getWhat="userLikes"
          initPosts={likes}
          params={{ user: profile.id, what: "likes", cursor }}
        />
      </div>
    </>
  );
}
