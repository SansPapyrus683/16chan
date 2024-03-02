import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { serverFetch } from "@/lib/utils";

export default async function userLikes({
  params,
  searchParams: sp,
}: {
  params: { handle: string };
  searchParams: { cursor: string | string[] | undefined };
}) {
  const ret = await serverFetch(
    async () => await api.user.profileByUsername(params.handle),
  );
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const profile = ret.val;

  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const likes = await api.user.userPosts({ user: profile.id, what: "likes", cursor });
  return (
    <>
      <div>{profile.username}'s likes</div>
      <br />
      <div>
        <PaginatedPostList
          getWhat="userPosts"
          initPosts={likes}
          params={{ user: profile.id, what: "likes", cursor }}
        />
      </div>
    </>
  );
}
