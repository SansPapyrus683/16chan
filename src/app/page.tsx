"use client";
import { FormEvent, useState } from "react";
import { api } from "@/trpc/react";
import { toBase64 } from "@/lib/files";

export default function Home() {
  const [pics, setPics] = useState<File[]>([]);
  const uploadPic = api.pic.create.useMutation();

  let onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    for (let p of pics) {
      uploadPic.mutate({
        post: 1,
        img: await toBase64(p),
        imgType: p.type,
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
