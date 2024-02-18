import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { z } from "zod";
import { PostList } from "@/components/PostList";
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
      <h1>16chan.</h1>
      <div className="space-y-4">
        results for the search query "{query}"
        <div>
          <PostList initPosts={res} getWhat="search" additional={{ query, sortBy }} />
        </div>
        these posts should be sorted by {sortBy}
        <div>
          {!userId && (
            <>
              you aren't signed in lol
              <br />
              <SignInButton>do it here</SignInButton>
            </>
          )}
        </div>
        <ol>
          <b>links (check the discord channel for how they should be arranged):</b>
          <li>
            <a href="/">browser (this page)</a>
          </li>
          <li>
            <a href="/following">following</a>
          </li>
          <li>
            <a href="/account">account page</a>
          </li>
          <li>
            <a href="/post/create">create post</a>
          </li>
          <li></li>
        </ol>
      </div>
    </>
  );
}
