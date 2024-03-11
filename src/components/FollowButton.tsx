"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

export function FollowButton({ uid }: { uid: string }) {
  const follow = api.user.follow.useMutation();
  return <Button onClick={() => follow.mutate(uid)}>Follow</Button>;
}
