import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { z } from "zod";
import { PaginatedPostList } from "@/components/PostList";
import { api } from "@/trpc/server";

const SortOrder = z.enum(["new", "likes"]).catch("new");

export default async function Browsing({
  searchParams,
}: {
  searchParams: {
    q: string | string[] | undefined;
    sort: string | string[] | undefined;
  };
}) {
  const { userId } = auth();
  const rawQ = searchParams.q;
  const query = Array.isArray(rawQ) ? rawQ.join(" ") : rawQ;
  const rawSort = searchParams.sort;
  const sortBy = SortOrder.parse(Array.isArray(rawSort) ? rawSort[0] : rawSort);

  const res = await api.browse.browse({ query, sortBy });

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
