import "@/globals.css";
import Link from "next/link";
import React from "react";

import { Comic_Neue } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "@/trpc/react";

const comicNeue = Comic_Neue({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "16chan",
  description: "if imgur & danbooru made love",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={comicNeue.className}>
        <TRPCReactProvider>
          <ClerkProvider>
            <nav className="flex justify-between bg-gray-200 p-6 pl-12 pr-12 text-xl">
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
              <div className="flex space-x-16">
                <div className="">
                  <Link href="/account">Account</Link>
                </div>
              </div>
            </nav>
            {children}
          </ClerkProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
