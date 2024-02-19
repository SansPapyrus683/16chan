"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function AddToAlbum({ pid }: { pid: string }) {
  const [aid, setAid] = useState("");
  const addPost = api.post.addToAlbum.useMutation();

  return (
    <div>
      <input
        value={aid}
        placeholder="album uuid (obv not practical)"
        onChange={(e) => setAid(e.target.value)}
        className="border-2"
      />
      <br />
      <button
        onClick={(e) => {
          e.preventDefault();
          addPost.mutate({ post: pid, album: aid });
        }}
        className="border-2 p-0.5"
      >
        submit
      </button>{" "}
    </div>
  );
}
