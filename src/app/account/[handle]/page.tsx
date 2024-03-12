import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";
import { serialize, serverFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const isFollowing = await api.user.isFollowing(profile.id);
  const albums = await api.user.userAlbums({ user: profile.id });

  return (
    <div className="flex space-x-10 space-y-4">
      <div className="space-y-4">
        <div>
          <Avatar className="h-40 w-40 align-middle">
            <AvatarImage src={profile.imageUrl} className="object-cover" />
            <AvatarFallback>`${profile.username}`</AvatarFallback>
          </Avatar>

          <div className="text-size-10 mt-3">{profile.username}</div>
        </div>

        {profile.id !== userId && (
          <FollowButton uid={profile.id} isFollowing={isFollowing} />
        )}

        <Button className="w-40 rounded-md border-2 p-0.5 text-center">
          <a href={`/account/${params.handle}/likes`}>Liked Posts</a>
        </Button>

        {userId === profile.id && <CreateAlbum />}

        <div>
          <h2>Albums</h2>
          <AlbumList initAlbums={albums} uid={profile.id} />
        </div>
      </div>

      <div>
        Posts
        <PaginatedPostList
          getWhat="userPosts"
          initPosts={serialize(posts)}
          params={{ user: profile.id, what: "posts", cursor }}
          likeButton={userId !== null}
        />
      </div>
    </div>
  );
}
