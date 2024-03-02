"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { useAuth } from "@clerk/nextjs";

type PostData = RouterOutputs["user"]["userPosts"];

export function PaginatedPostList({
  initPosts,
  getWhat,
  additional,
  likeButton = false,
}: {
  initPosts: PostData;
  getWhat: "userPosts" | "following" | "search";
  additional?: object;
  likeButton?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const modParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  let query;
  switch (getWhat) {
    case "userPosts":
      query = api.user.userPosts;
      break;
    case "following":
      query = api.user.followedPosts;
      break;
    case "search":
      query = api.browse.browse;
      break;
  }
  const params = { cursor: searchParams.get("cursor") ?? undefined, ...additional };
  //@ts-ignore
  const { data } = query.useQuery(params, { initialData: initPosts, staleTime: 5e3 });

  const {
    posts,
    prevCursor,
    nextCursor,
  }: {
    posts: PostData["posts"];
    prevCursor: string | undefined;
    nextCursor: string | undefined;
  } = data || {};

  return (
    <>
      <PostList posts={posts} likeButton={likeButton} />
      <div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", prevCursor!)}`);
          }}
          disabled={prevCursor === undefined}
          className="border p-1"
        >
          prev
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", nextCursor!)}`);
          }}
          className="ml-3 border p-1"
          disabled={nextCursor === undefined}
        >
          next
        </button>
      </div>
    </>
  );
}

export function PostList({
  posts,
  likeButton = false,
}: {
  posts: PostData["posts"];
  likeButton?: boolean;
}) {
  // hm you'd think this would be undefined for a lil @ the start but it actually isn't
  const { userId } = useAuth();

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((p) => (
        <div key={p.id} className="flex flex-col">
          <Link href={`/post/${p.id}`}>
            <Image
              key={p.id}
              className="w-auto"
              src={p.images![0]!.img}
              alt="post preview"
              width={200}
              height={200}
            />
          </Link>
          <Link href={`/post/${p.id}`}>{p.title}</Link>
          {likeButton && (
            <LikeButton pid={p.id} liked={p.likes!.some((i) => i.userId === userId)} />
          )}
        </div>
      ))}
    </div>
  );
}
