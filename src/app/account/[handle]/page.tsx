import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PaginatedPostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";

export default async function Account({
  params,
  searchParams: sp,
}: {
  params: { handle: string };
  searchParams: { cursor: string | string[] | undefined };
}) {
  const handle = params.handle;
  const { userId } = auth();

  let profile;
  try {
    profile = await api.user.profileByUsername(handle);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }

  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const posts = await api.user.userPosts({ user: profile.id, cursor });
  const albums = await api.user.userAlbums({ user: profile.id });

  return (
    <div className="space-y-4">
      <div>account page for {profile.username}</div>
      {profile.id !== userId && <FollowButton uid={profile.id} />}
      <div>
        <a href={`/account/${handle}/likes`}>see their likes</a>
      </div>
      <div>
        <PaginatedPostList
          getWhat="userPosts"
          initPosts={posts}
          additional={{ user: profile.id, what: "posts" }}
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
