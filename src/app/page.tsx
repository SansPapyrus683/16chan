import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { PaginatedPostList } from "@/components/PostList";
import { api } from "@/trpc/server";
import { serialize } from "@/lib/utils";
import { SortMenu } from "@/components/SortMenu";

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
      <div className="mt-5 space-y-4">
        <div className="flex justify-between align-middle">
          <h1>Results for "{query}"</h1>
          <div>
            <h1>Sort By:</h1>
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
