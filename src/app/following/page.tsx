import { api } from "@/trpc/server";
import { UserButton } from "@clerk/nextjs";
import { PaginatedPostList } from "@/components/PostList";
import { auth } from "@clerk/nextjs/server";

export default async function NewPage() {
  const posts = await api.user.followedPosts();
  const { userId } = auth();

  return (
    <div className="space-y-4">
      <UserButton />
      <div>posts by users u follow</div>
      <div>
        <PaginatedPostList
          initPosts={posts}
          getWhat="following"
          additional={{ user: userId! }}
          likeButton
        />
      </div>
    </div>
  );
}
