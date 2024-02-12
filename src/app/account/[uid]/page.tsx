import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";

export default async function Account({ params }: { params: { uid: string } }) {
  let profile;
  try {
    profile = await api.user.profile(params.uid);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const posts = await api.user.userPosts({ user: params.uid });
  const likes = await api.user.userPosts({ user: params.uid, what: "likes" });

  return (
    <>
      <UserButton />
      <div>account page for {profile.username}</div>
      <br />
      <div>
        <b>all their posts are here</b>
        <PostList initPosts={posts} uid={params.uid} />
      </div>
      <div>
        <b>and all their likes</b>
        <PostList initPosts={likes} uid={params.uid} getLikes />
      </div>
    </>
  );
}
