"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";

export function AddToAlbum({ pid }: { pid: string }) {
  const { userId } = useAuth();
  const { data } = api.user.userAlbums.useQuery({ user: userId ?? "" });
  const { albums } = data ?? { albums: [] };

  const addPost = api.post.addToAlbum.useMutation();
  const [aid, setAid] = useState("");

  return (
    <div>
      <select onChange={(e) => setAid(e.target.value)}>
        {albums.map((a) => (
          <option value={a.id} key={a.id}>
            {a.name}
          </option>
        ))}
      </select>
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
