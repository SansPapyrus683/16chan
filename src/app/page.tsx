import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { z } from "zod";
import { PaginatedPostList } from "@/components/posts/PostList";
import { api } from "@/trpc/server";

const SortOrder = z.enum(["new", "likes"]).catch("new");

export default async function Browsing({
  searchParams: sp,
}: {
  searchParams: {
    q: string | string[] | undefined;
    sort: string | string[] | undefined;
    cursor: string | string[] | undefined;
  };
}) {
  const { userId } = auth();
  const query = Array.isArray(sp.q) ? sp.q.join(" ") : sp.q;
  const sortBy = SortOrder.parse(Array.isArray(sp.sort) ? sp.sort[0] : sp.sort);
  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;

  const res = await api.browse.browse({ query, sortBy, cursor });
  return (
    <>
      <div className="space-y-4">
        <div>
          {!userId && (
            <>
              you aren't signed in lol
              <br />
              <SignInButton>do it here</SignInButton>
            </>
          )}
        </div>
        <div>
          results for the search query "{query}" sorted by {sortBy}
        </div>
        <div>
          <PaginatedPostList
            initPosts={res}
            getWhat="search"
            additional={{ query, sortBy }}
          />
        </div>
      </div>
    </>
  );
}
