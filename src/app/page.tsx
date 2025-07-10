import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { PaginatedPostList } from "@/components/PostList";
import { api } from "@/trpc/server";
import { serialize } from "@/lib/utils";
import { SortMenu } from "@/components/SortMenu";

const SortOrder = z.enum(["new", "likes"]).catch("new");

export default async function Browsing({
  searchParams,
}: {
  searchParams: Promise<{
    q: string | string[] | undefined;
    sort: string | string[] | undefined;
    cursor: string | string[] | undefined;
  }>;
}) {
  const { userId } = await auth();
  const { q, sort, cursor: c } = await searchParams;
  const query = Array.isArray(q) ? q.join(" ") : q;
  const sortBy = SortOrder.parse(Array.isArray(sort) ? sort[0] : sort);
  const cursor = Array.isArray(c) ? c[0] : c;

  const res = await api.browse.browse({ query, sortBy, cursor });
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2>Results for "{query}"</h2>
          <div className="flex items-center space-x-1">
            <h2>Sort By: </h2>
            <SortMenu options={["new", "likes"]} initVal={sortBy} placeholder={""} />
          </div>
        </div>
        <div>
          <PaginatedPostList
            initPosts={serialize(res)}
            getWhat="search"
            params={{ query, sortBy, cursor }}
            likeButton={userId !== null}
          />
        </div>
      </div>
    </>
  );
}
