"use client";

import { api } from "@/trpc/react";
import { PostList } from "@/components/PostList";
import { RouterOutputs } from "@/trpc/shared";

export function Album({
  aid,
  initAlbum,
}: {
  aid: string;
  initAlbum: RouterOutputs["album"]["get"];
}) {
  const { data: album } = api.album.get.useQuery(aid, { initialData: initAlbum });
  return !album ? null : (
    <>
      <h1>{album.name}</h1>
      <PostList posts={album.posts.map((p) => p.post)} likeButton />
    </>
  );
}
