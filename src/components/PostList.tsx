"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";

export function PostList({
  initPosts,
  uid,
}: {
  initPosts: RouterOutputs["user"]["userPosts"];
  uid: string;
}) {
  const { data: posts } = api.user.userPosts.useQuery(
    { user: uid },
    { initialData: initPosts },
  );
  const deletePost = api.post.delete.useMutation();
  const likePost = api.post.like.useMutation();

  return (
    <ul>
      {(posts ?? []).map((v) => (
        <li key={v.id}>
          <a href={`/post/${v.id}`}>{v.title}</a> |{" "}
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
        </li>
      ))}
    </ul>
  );
}
