"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { ThumbsUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function LikeButton({ pid, liked }: { pid: string; liked: boolean }) {
  const router = useRouter();
  const onSuccess = () => {
    setDisabled(false);
    router.refresh();
  };
  const likePost = api.post.like.useMutation({ onSuccess });
  const unlikePost = api.post.unlike.useMutation({ onSuccess });

  const [disabled, setDisabled] = useState(false);

  return (
    <div className="p-1">
      <Button
        onClick={(e) => {
          e.preventDefault();
          (liked ? unlikePost : likePost).mutate(pid);
        }}
        className={cn(
          "duration-020 group/like rounded-l-full rounded-r-full p-2 transition hover:bg-red-600",
          { "bg-red-600": liked },
        )}
        disabled={disabled}
        variant="outline"
      >
        <div
          className={cn(
            "duration-020 flex items-center text-black transition group-hover/like:text-white",
            { "text-white": liked },
          )}
        >
          <ThumbsUpIcon />
        </div>
      </Button>
    </div>
  );
}
