"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useAuth } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddToAlbum({ pid }: { pid: string }) {
  const { userId } = useAuth();
  const { data } = api.user.userAlbums.useQuery({ user: userId ?? "" });
  const { albums } = data ?? { albums: [] };

  const addPost = api.post.addToAlbum.useMutation();
  const [aid, setAid] = useState("");

  return (
    <div className="flex justify-between">
      <Select onValueChange={setAid}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Album" />
        </SelectTrigger>
        <SelectContent>
          {albums.map((a) => (
            <SelectItem value={a.id} key={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={(e) => {
          addPost.mutate({ post: pid, album: aid });
        }}
        className="border-2 p-0.5"
      >
        Add
      </button>
    </div>
  );
}
