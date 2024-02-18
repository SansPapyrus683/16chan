"use client";

import { type FormEvent, useState } from "react";
import { toBase64 } from "@/lib/files";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { parseTag } from "@/lib/types";

export function CreatePost() {
  const router = useRouter();

  const createPost = api.post.create.useMutation({
    onSuccess: (data) => {
      setButtonText("success!");
      router.push(`/post/${data.id}`);
    },
    onError: () => {
      setButtonText("error...");
    },
  });

  const [pics, setPics] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [buttonText, setButtonText] = useState("submit");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonText("creating...");
    createPost.mutate({
      title: name,
      tags: tags.split(/\s+/).map((t) => {
        const [category, name] = t.split(":");
        return parseTag(name!, category);
      }),
      images: await Promise.all(pics.map(async (p) => await toBase64(p))),
    });
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setPics(Array.from(e.target.files!));
          }}
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags..."
          className="block border-2"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name..."
          className="border-2"
        />
        <button type="submit">{buttonText}</button>
      </form>
    </div>
  );
}
