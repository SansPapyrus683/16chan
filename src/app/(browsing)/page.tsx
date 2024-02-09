import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
  const { userId } = auth();

  return (
    <>
      <div>
        16chan. (this home page is supposed to contain the trending tab)
        <br />
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
    </>
  );
}
