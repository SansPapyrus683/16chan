"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  let { albums, prevCursor, nextCursor } = data || {};
  albums = albums ?? []; // cursed tbh

  return (
    <>
      {albums.length > 0 ? (
        <ul>
          {(albums ?? []).map((v) => (
            <li key={v.id}>
              <Link className="hover:underline" href={`/album/${v.id}`}>
                {v.name}
              </Link>
            </li>
          ))}
        </ul>
          <br />
      ) : (
        <div>No albums...</div>
      )}
      <div className="flex space-x-4">
        <Button
          onClick={async (e) => {
            e.preventDefault();
            setAt(prevCursor);
          }}
          disabled={prevCursor === undefined}
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
          disabled={isPlaceholderData || nextCursor === undefined}
        >
          Next Page
        </Button>
      </div>
    </>
  );
}
