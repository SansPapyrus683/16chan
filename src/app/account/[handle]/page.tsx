import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";
import { serialize, serverFetch } from "@/lib/utils";
import smartcrop from "smartcrop";
import Image from "next/image";
import Link from "next/link";
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
    <div className="flex space-y-4">
      <div>
        <Avatar className="h-40 w-40">
          <AvatarImage src={profile.imageUrl} />
          <AvatarFallback>`${profile.username}`</AvatarFallback>
        </Avatar>
        <div className="text-size-10 items-center">{profile.username}</div>
        {profile.id !== userId && <FollowButton uid={profile.id} />}
        <a href={`/account/${params.handle}/likes`}>
          <div className="w-40 rounded-md border-2 p-0.5 text-center">Liked Posts</div>
        </a>

        <div>
          {userId === profile.id && <CreateAlbum />}
          <br />
          Albums
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
