import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";

export default async function Account({ params }: { params: { uid: string } }) {
  const uid = params.uid;

  let profile;
  try {
    profile = await api.user.profile(uid);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const posts = await api.user.userPosts({ user: uid });

  return (
    <div className="space-y-4">
      <UserButton />
      <div>account page for {profile.username}</div>
      <div>
        <a href={`/account/${uid}/likes`}>see their likes</a>
      </div>
      <div>
        <PostList initPosts={posts} uid={uid} getWhat="posts" />
      </div>

      <div>
        <CreateAlbum />
        <br />
        TODO: also have a list of their albums here
      </div>
    </div>
  );
}
