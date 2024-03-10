import Link from "next/link";
import {SignInButton, UserButton} from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server";

export function NavBar() {
  const { userId } = auth();

  return (
    <nav className="fixed z-50 flex h-16 w-full items-center justify-between border-b border-gray-300 bg-white pl-10 pr-10 text-base">
      <div className="flex space-x-16">
        <div className="">
          <Link href="/">16chan</Link>
        </div>
        <div className="">
          <Link href="/following">Following</Link>
        </div>
        <div className="">
          <Link href="/post/create">New Post</Link>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {
          userId ? <>
            <Link href="/account">Profile</Link>
            <UserButton/>
          </> : <>
            <SignInButton>
              Sign In
            </SignInButton>
          </>
        }
      </div>
    </nav>
  );
}
