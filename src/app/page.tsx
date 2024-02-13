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
<<<<<<< HEAD
      <div>
        16chan.
        <form onSubmit={onSubmit}>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              setPics(Array.from(e.target.files!));
            }}
          />
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit">submit</Button>
        </form>
      </div>
      <br />
      <div>
        <ul>
          {(posts ?? []).map((v) => (
            <li key={v.id}>
              {v.title} | {v.images.map((i) => i.img).join(", ")} |{" "}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  deletePost.mutate(v.id);
                }}
                className="border-2"
              >
                delete
              </button>{" "}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  likePost.mutate(v.id);
                }}
                className="border-2"
              >
                like
              </button>
            </li>
          ))}
        </ul>
=======
      <div className="space-y-4">
        16chan. right now the results for the search query "{query}"
        <br />
        if it's empty, it should show all posts
        <br />
        these posts should be sorted by {sort}
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
>>>>>>> main
      </div>
    </>
  );
}
