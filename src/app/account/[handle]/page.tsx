import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";
import { serialize, serverFetch } from "@/lib/utils";

export default async function Account({
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

  const { userId } = auth();

  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const posts = await api.user.userPosts({ user: profile.id, cursor });
  const albums = await api.user.userAlbums({ user: profile.id });

  return (
    <div className="space-y-4">
      <div>account page for {profile.username}</div>
      {profile.id !== userId && <FollowButton uid={profile.id} />}
      <div>
        <a href={`/account/${params.handle}/likes`}>see their likes</a>
      </div>
      <div>
        <PaginatedPostList
          getWhat="userPosts"
          initPosts={serialize(posts)}
          params={{ user: profile.id, what: "posts", cursor }}
          likeButton
        />
      </div>

      <div>
        <CreateAlbum />
        <br />
        <AlbumList initAlbums={albums} uid={profile.id} />
      </div>
    </div>
  );
}
