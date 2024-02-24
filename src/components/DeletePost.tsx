"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function DeletePost({ pid }: { pid: string }) {
  const router = useRouter();
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => router.push("/account"),
  });
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        deletePost.mutate(pid);
      }}
      className="border-2 p-0.5"
    >
      delete
    </button>
  );
}
