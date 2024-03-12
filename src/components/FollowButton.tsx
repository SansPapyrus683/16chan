"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function FollowButton({
  uid,
  isFollowing,
}: {
  uid: string;
  isFollowing: boolean;
}) {
  const router = useRouter();
  const follow = api.user.follow.useMutation({ onSuccess: () => router.refresh() });
  const unfollow = api.user.unfollow.useMutation({ onSuccess: () => router.refresh() });
  return (
    <Button onClick={() => (isFollowing ? unfollow : follow).mutate(uid)}
      className="w-40 items-center rounded-md border-2 p-0.5">
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
