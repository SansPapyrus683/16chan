import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { auth } from "@clerk/nextjs/server";
import { serialize } from "@/lib/utils";

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
      <h1>Following Posts</h1>
      <div>
        <PaginatedPostList
          initPosts={serialize(posts)}
          getWhat="following"
          params={{ user: userId!, cursor }}
          likeButton
        />
      </div>
    </div>
  );
}
