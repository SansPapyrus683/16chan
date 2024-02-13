import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export default function Browsing({
  searchParams,
}: {
  searchParams: { q: string | string[] | undefined };
}) {
  const { userId } = auth();
  const rawQ = searchParams.q;
  const query = Array.isArray(rawQ) ? rawQ.join(" ") : rawQ;

  return (
    <>
      <div className="space-y-4">
        16chan. right now the results for the search query "{query}"
        <br />
        if it's empty, it should show all posts
        <br />
        by default, posts are sorted by new but there should be options to change that
        <div>
          {userId ? (
            <>
              <a href={`/account/${userId}`}>account page</a>
              <br />
              <a href="/post/create">create post</a>
            </>
          ) : (
            <>
              you aren't signed in lol
              <br />
              <SignInButton>do it here</SignInButton>
            </>
          )}
        </div>
      </div>
    </>
  );
}
