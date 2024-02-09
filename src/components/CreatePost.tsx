"use client";

import { type FormEvent, useEffect, useState } from "react";
import { toBase64 } from "@/lib/files";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function CreatePost() {
  const router = useRouter();

  const createPost = api.post.create.useMutation();

  const [pics, setPics] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [buttonText, setButtonText] = useState("submit");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonText("creating...");
    createPost.mutate({
      title: name,
      images: await Promise.all(pics.map(async (p) => await toBase64(p))),
    });
  };
  useEffect(() => {
    if (createPost.isSuccess) {
      setButtonText("success!");
      router.push(`/post/${createPost.data.id}`);
    }
  }, [createPost.isSuccess]);

  return (
    <div>
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
        <button type="submit">{buttonText}</button>
      </form>
    </div>
  );
}
