"use client";

import { type FormEvent, useState } from "react";
import { toBase64 } from "@/lib/files";
import { api } from "@/trpc/react";

export function CreatePost({ username }: { username: string }) {
  const createPost = api.post.create.useMutation();

  const [pics, setPics] = useState<File[]>([]);
  const [name, setName] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost.mutate({
      title: name,
      images: await Promise.all(pics.map(async (p) => await toBase64(p))),
    });
  };

  return (
    <div>
      account page for user {username}
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setPics(Array.from(e.target.files!));
          }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-2"
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
}
