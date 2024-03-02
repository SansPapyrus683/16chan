"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export function LikeButton({ pid, liked, ...props }: { pid: string; liked: boolean }) {
  const likePost = api.post.like.useMutation({
    onSuccess: () => setDisabled(false),
  });
  const unlikePost = api.post.unlike.useMutation({
    onSuccess: () => setDisabled(false),
  });
  const [disabled, setDisabled] = useState(false);

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        setDisabled(true);
        (liked ? unlikePost : likePost).mutate(pid);
      }}
      className="border-2 p-0.5"
      disabled={disabled}
    >
      {liked ? "unlike" : "like"}
    </button>
  );
}
