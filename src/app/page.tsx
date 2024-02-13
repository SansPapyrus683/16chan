import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { z } from "zod";

const SortOrder = z.enum(["new", "trending", "likes"]).catch("new");

export default function Browsing({
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
  const sort = SortOrder.parse(Array.isArray(rawSort) ? rawSort[0]! : rawSort);

  return (
    <>
      <div className="space-y-4">
        16chan. right now the results for the search query "{query}"
        <br />
        if it's empty, it should show all posts
        <br />
        these posts should be sorted by {sort}
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
