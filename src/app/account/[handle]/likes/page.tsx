import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { PaginatedPostList } from "@/components/PostList";
import { UserButton } from "@clerk/nextjs";

export default async function userLikes({ params }: { params: { handle: string } }) {
  let profile;
  try {
    profile = await api.user.profileByUsername(params.handle);
  } catch (e) {
    if (e instanceof TRPCError && e.code === "NOT_FOUND") {
      return notFound();
    }
    return <div>something terrible has happened</div>;
  }
  const likes = await api.user.userPosts({ user: profile.id, what: "likes" });

  return (
    <>
      <UserButton />
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
