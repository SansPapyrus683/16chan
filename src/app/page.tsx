"use client";
import { FormEvent, useState } from "react";
import { api } from "@/trpc/react";
import { toBase64 } from "@/lib/files";

export default function Home() {
  const [pic, setPic] = useState<File | null>(null);
  const uploadPic = api.pic.create.useMutation();

  let onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pic !== null) {
      uploadPic.mutate({
        post: 1,
        img: await toBase64(pic),
        imgType: pic.type,
      });
    }
  };

  return (
    <div>
      16chan.
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setPic(e.target.files![0]!);
          }}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
}
