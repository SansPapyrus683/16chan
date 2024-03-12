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
            <a className="hover:underline" href={`/album/${v.id}`}>
              {v.name}
            </a>{" "}
            | {v.id}
          </li>
        ))}
      </ul>
      <div>
        <Button
          onClick={async (e) => {
            e.preventDefault();
            setAt(prevCursor);
          }}
          disabled={prevCursor === undefined}
          className="border-4 p-1"
        >
          Prev Page
        </Button>
        <Button
          onClick={async (e) => {
            console.assert(
              nextCursor !== undefined && !isPlaceholderData,
              "what the hell?",
            );
            e.preventDefault();
            setAt(nextCursor);
          }}
          className="ml-3 border-4 p-1"
          disabled={isPlaceholderData || nextCursor === undefined}
        >
          Next Page
        </Button>
      </div>
    </>
  );
}
