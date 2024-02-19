"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const [at, setAt] = useState<undefined | string>(initPosts.posts[0]?.id);

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
  const params = { cursor: at, ...additional };

  //@ts-ignore
  const { data, isPlaceholderData } = query.useQuery(params, {
    //@ts-ignore
    placeholderData: (prevRes) => prevRes ?? initPosts,
  });
  const { posts, prevCursor, nextCursor } = data || {};

  return (
    <>
      <PostList posts={posts as PostData["posts"]} likeButton={likeButton} />
      <div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            setAt(prevCursor);
          }}
          disabled={prevCursor === undefined}
          className="border-4 p-1"
        >
          prev page
        </button>
        <button
          onClick={async (e) => {
            console.assert(
              nextCursor !== undefined && !isPlaceholderData,
              "what the hell?",
            );
            e.preventDefault();
            setAt(nextCursor);
          }}
          className="ml-3 border-4 p-1"
          disabled={isPlaceholderData || nextCursor === undefined}
        >
          next page
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
  likeButton: boolean;
}) {
  const utils = api.useUtils();
  const likePost = api.post.like.useMutation({
    onSuccess: () => utils.user.userPosts.invalidate({ what: "likes" }),
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((v) => (
        <div key={v.id} className="flex flex-col">
          <Link href={`/post/${v.id}`}>
            <Image
              key={v.id}
              className="w-auto"
              src={v.images![0]!.img}
              alt="post preview"
              width={200}
              height={200}
            />
          </Link>
          <Link href={`/post/${v.id}`}>{v.title}</Link>
          {v.id}
          {likeButton && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                likePost.mutate(v.id);
              }}
              className="border-2 p-0.5"
            >
              like
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
