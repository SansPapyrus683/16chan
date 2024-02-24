import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { serverFetch } from "@/lib/utils";

export default async function userLikes({ params }: { params: { handle: string } }) {
  const ret = await serverFetch(
    async () => await api.user.profileByUsername(params.handle),
  );
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const profile = ret.val;

  const likes = await api.user.userPosts({ user: profile.id, what: "likes" });
  return (
    <>
      <div>{profile.username}'s likes</div>
      <br />
      <div>
        <PaginatedPostList
          getWhat="userPosts"
          initPosts={likes}
          additional={{ user: profile.id, what: "likes" }}
        />
      </div>
    </>
  );
}
