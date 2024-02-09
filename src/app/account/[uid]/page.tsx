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
    // console.log(e.code);
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const posts = await api.user.userPosts({ user: params.uid });

  return (
    <>
      <UserButton />
      <div>account page for {profile.username}</div>
      <div>
        <PostList initPosts={posts} uid={params.uid} />
      </div>
    </>
  );
}
