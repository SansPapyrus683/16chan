import { api } from "@/trpc/server";
import { UserButton } from "@clerk/nextjs";
import { PaginatedPostList } from "@/components/posts/PostList";
import { auth } from "@clerk/nextjs/server";

export default async function NewPage({
  searchParams: sp,
}: {
  searchParams: { cursor: string | string[] | undefined };
}) {
  const { userId } = auth();
  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const posts = await api.user.followedPosts({ cursor });

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
