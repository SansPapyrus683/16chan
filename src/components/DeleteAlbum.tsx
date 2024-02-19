"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export function DeleteAlbum({ aid }: { aid: string }) {
  const router = useRouter();
  const deleteAlbum = api.album.delete.useMutation({
    onSuccess: () => router.push("/account"),
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        deleteAlbum.mutate(aid);
      }}
    >
      delete album
    </button>
  );
}
