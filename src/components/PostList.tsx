"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";

export function PostList({
  initPosts,
  uid,
  getWhat,
}: {
  initPosts: RouterOutputs["user"]["userPosts"];
  uid: string;
  getWhat: "likes" | "posts";
}) {
  const utils = api.useUtils();
  const [at, setAt] = useState<undefined | string>(initPosts.posts[0]?.id);

  let query;
  let params;
  switch (getWhat) {
    case "posts":
      query = api.user.userPosts;
      params = { user: uid, what: "posts", cursor: at };
      break;
    case "likes":
      query = api.user.userPosts;
      params = { user: uid, what: "likes", cursor: at };
      break;
  }

  //@ts-ignore
  const { data, isPlaceholderData } = query.useQuery(params, {
    placeholderData: (prevRes) => prevRes ?? initPosts,
  });
  const { posts, prevCursor, nextCursor } = data || {};
  const likePost = api.post.like.useMutation({
    onSuccess: () => utils.user.userPosts.invalidate(),
  });

  return (
    <>
      <ul>
        {(posts ?? []).map((v) => (
          <li key={v.id}>
            <a href={`/post/${v.id}`}>{v.title}</a> | {v.id}
            {getWhat !== "likes" && (
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
