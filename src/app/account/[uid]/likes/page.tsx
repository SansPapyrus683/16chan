import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PostList } from "@/components/PostList";
import { UserButton } from "@clerk/nextjs";

export default async function userLikes({ params }: { params: { uid: string } }) {
  let profile;
  try {
    profile = await api.user.profile(params.uid);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const likes = await api.user.userPosts({ user: params.uid, what: "likes" });

  return (
    <>
      <UserButton />
      <div>{profile.username}'s likes</div>
      <br />
      <div>
        <PostList initPosts={likes} uid={params.uid} getLikes />
      </div>
    </>
  );
}
