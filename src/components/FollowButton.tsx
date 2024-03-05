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
      className="border-2 p-0.5"
    >
      follow
    </button>
  );
}
