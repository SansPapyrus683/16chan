"use client";

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

export function NavBar() { 
  return (
    <nav className="flex fixed z-50 w-full h-16 justify-between border-b border-gray-300 bg-white items-center pl-10 pr-10 text-base">
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
        <div className="">
          <Link href="/account">Profile</Link>
        </div>
        <div className="">
          <UserButton />
        </div>
      </div>
    </nav>
  )
}

