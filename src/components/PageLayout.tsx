"use client";

import Link from "next/link"

export function PageLayout() { 
  return (
    <nav className="bg-gray-200 flex p-6 pl-12 pr-12 justify-between text-xl">
      <div className="flex space-x-16">
        <div className="">
          <Link href="/">
            16chan
          </Link>
        </div>
        <div className="">
          <Link href="/following">
            Following
          </Link>
        </div>
        <div className="">
          <Link href="/post/create">
            New Post
          </Link>
        </div>
      </div>
      <div className="flex space-x-16">
        <div className="">
          <Link href="/account">
            Account
          </Link>
        </div>
      </div>
    </nav>
  )
}

