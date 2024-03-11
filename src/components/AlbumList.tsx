"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AlbumList({
  initAlbums,
  uid,
}: {
  initAlbums: RouterOutputs["user"]["userAlbums"];
  uid: string;
}) {
  const [at, setAt] = useState<undefined | string>(initAlbums.albums[0]?.id);

  const { data, isPlaceholderData } = api.user.userAlbums.useQuery(
    { user: uid, cursor: at },
    { placeholderData: (prevRes) => prevRes ?? initAlbums },
  );
  const { albums, prevCursor, nextCursor } = data || {};

  return (
    <>
      <ul>
        {(albums ?? []).map((v) => (
          <li key={v.id}>
            <a href={`/album/${v.id}`}>{v.name}</a> | {v.id}
          </li>
        ))}
      </ul>
      <div className="flex">
        <Button onClick={() => setAt(prevCursor)} disabled={prevCursor === undefined}>
          prev
        </Button>
        <Button
          onClick={() => setAt(nextCursor)}
          disabled={isPlaceholderData || nextCursor === undefined}
          className="ml-3"
        >
          next
        </Button>
      </div>
    </>
  );
}
