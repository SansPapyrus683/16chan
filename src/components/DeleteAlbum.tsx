"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export function DeleteAlbum({ aid }: { aid: string }) {
  const router = useRouter();
  const deleteAlbum = api.album.delete.useMutation({
    onSuccess: () => router.push("/account"),
  });

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        deleteAlbum.mutate(aid);
      }}
      className="bg-red-600"
    >
      Delete album
    </Button>
  );
}
