"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeletePost({ pid }: { pid: string }) {
  const router = useRouter();
  const deletePost = api.post.delete.useMutation({
    onSuccess: () => router.push("/account"),
  });
  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        deletePost.mutate(pid);
      }}
      className="bg-red-600"
    >
      delete
    </Button>
  );
}
