"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

export function LikeButton({ pid, liked }: { pid: string; liked: boolean }) {
  const likePost = api.post.like.useMutation({
    onSuccess: () => setDisabled(false),
  });
  const unlikePost = api.post.unlike.useMutation({
    onSuccess: () => setDisabled(false),
  });
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="p-1">
      <button
        onClick={async (e) => {
          e.preventDefault();
          (liked ? unlikePost : likePost).mutate(pid);
        }}
        className={`rounded-l-full rounded-r-full ${liked ? "bg-red-600" : "bg-black"} p-2 transition duration-500 hover:bg-red-600`}
        disabled={disabled}
      >
        <div className="flex items-center text-white">
          {liked ? (
            <HeartFilledIcon className="mr-2" />
          ) : (
            <HeartIcon className="mr-2" />
          )}
          Like
        </div>
      </button>
    </div>
  );
}
