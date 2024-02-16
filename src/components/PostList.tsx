"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";

export function PostList({
  initPosts,
  getWhat,
  additional,
  likeButton = false,
}: {
  initPosts: RouterOutputs["user"]["userPosts"];
  getWhat: "userPosts" | "following" | "search";
  additional?: object;
  likeButton?: boolean;
}) {
  const utils = api.useUtils();
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
  }
  const params = { cursor: at, ...additional };

  //@ts-ignore
  const { data, isPlaceholderData } = query.useQuery(params, {
    //@ts-ignore
    placeholderData: (prevRes) => prevRes ?? initPosts,
  });
  const { posts, prevCursor, nextCursor } = data || {};
  const likePost = api.post.like.useMutation({
    onSuccess: () => utils.user.userPosts.invalidate(),
  });

  return (
    <>
      <ul>
        {((posts as { id: string; title: string }[]) ?? []).map((v) => (
          <li key={v.id}>
            <a href={`/post/${v.id}`}>{v.title}</a> | {v.id}
            {likeButton && (
              <>
                {" | "}
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    likePost.mutate(v.id);
                  }}
                  className="border-2 p-0.5"
                >
                  like
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
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
