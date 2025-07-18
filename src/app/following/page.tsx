import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { auth } from "@clerk/nextjs/server";
import { serialize } from "@/lib/utils";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const { userId } = await auth();
  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const posts = await api.user.followedPosts({ cursor });

  return (
    <div className="space-y-4">
      <h2>Following Posts</h2>
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
