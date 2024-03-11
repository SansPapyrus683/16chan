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
    <Button onClick={() => (isFollowing ? unfollow : follow).mutate(uid)}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
