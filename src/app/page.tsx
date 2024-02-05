"use client";
import { type FormEvent, useState } from "react";
import { api } from "@/trpc/react";
import { toBase64 } from "@/lib/files";

export default function Home() {
  const [pics, setPics] = useState<File[]>([]);
  const createPost = api.post.create.useMutation();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createPost.mutate({
      title: "test post lmao",
      images: await Promise.all(pics.map(async (p) => await toBase64(p))),
    });
  };

  return (
    <div>
      16chan.
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setPics([...pics, ...Array.from(e.target.files!)]);
          }}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
}
