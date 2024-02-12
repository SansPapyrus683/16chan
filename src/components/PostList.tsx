"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";

export function PostList({
  initPosts,
  uid,
  getLikes = false,
}: {
  initPosts: RouterOutputs["user"]["userPosts"];
  uid: string;
  getLikes?: boolean;
}) {
  const utils = api.useUtils();
  const [at, setAt] = useState<undefined | string>(initPosts.posts[0]?.id);

  const { data, isPlaceholderData } = api.user.userPosts.useQuery(
    { user: uid, what: getLikes ? "likes" : "posts", cursor: at },
    { placeholderData: (prevRes) => prevRes ?? initPosts },
  );
  const { posts, prevCursor, nextCursor } = data || {};
  const deletePost = api.post.delete.useMutation({
    onSuccess: (data) => {
      if (data.id === at) {
        setAt(posts![1]?.id);
      }
      utils.user.userPosts.invalidate();
    },
  });
  const likePost = api.post.like.useMutation({
    onSuccess: () => utils.user.userPosts.invalidate(),
  });

  return (
    <>
      <ul>
        {(posts ?? []).map((v) => (
          <li key={v.id}>
            <a href={`/post/${v.id}`}>{v.title}</a> | {v.id}
            {!getLikes && (
              <>
                {" | "}
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
              </>
            )}
          </li>
        ))}
      </ul>
      <br />
      <div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            setAt(prevCursor);
          }}
          disabled={prevCursor === undefined}
          className="border-4"
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
          className="ml-3 border-4"
          disabled={isPlaceholderData || nextCursor === undefined}
        >
          next page
        </button>
      </div>
    </>
  );
}
