"use client";

import { api } from "@/trpc/react";

export function FollowButton({ uid }: { uid: string }) {
  const follow = api.user.follow.useMutation();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        follow.mutate(uid);
      }}
      className="w-40 items-center rounded-md border-2 p-0.5"
    >
      Follow
    </button>
  );
}
