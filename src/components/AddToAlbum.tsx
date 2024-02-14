"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function AddToAlbum({ pid }: { pid: string }) {
  const [aid, setAid] = useState("");
  const addPost = api.post.addToAlbum.useMutation();

  return (
    <>
      obviously the user shouldn't have to give the album uuid
      <br />
      <form>
        <input
          value={aid}
          onChange={(e) => setAid(e.target.value)}
          className="border-2"
        />
        <br />
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            addPost.mutate({ post: pid, album: aid });
          }}
          className="border-2 p-0.5"
        >
          submit
        </button>
      </form>
    </>
  );
}
