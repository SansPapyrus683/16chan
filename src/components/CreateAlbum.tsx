"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function CreateAlbum() {
  const router = useRouter();
  const create = api.album.create.useMutation({
    onSuccess: (data) => {
      router.push(`/album/${data.id}`);
    },
  });

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        create.mutate();
      }}
      className="border-2 p-1"
    >
      create album lol
    </button>
  );
}
