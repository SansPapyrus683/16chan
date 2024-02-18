import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";

export default async function Account({ params }: { params: { handle: string } }) {
  const handle = params.handle;
  const { userId } = auth();

  let profile;
  try {
    profile = await api.user.profile(handle);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const posts = await api.user.userPosts({ user: profile.id });
  const albums = await api.user.userAlbums({ user: profile.id });

  return (
    <div className="space-y-4">
      <UserButton />
      <div>account page for {profile.username}</div>
      {profile.id !== userId && <FollowButton uid={profile.id} />}
      <div>
        <a href={`/account/${handle}/likes`}>see their likes</a>
      </div>
      <div>
        <PostList
          getWhat="userPosts"
          initPosts={posts}
          additional={{ user: profile.id, what: "posts" }}
          likeButton
        />
      </div>

      <div>
        <CreateAlbum />
        <br />
        <AlbumList initAlbums={albums} uid={handle} />
      </div>
    </div>
  );
}
