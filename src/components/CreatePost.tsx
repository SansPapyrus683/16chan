"use client";

import { type FormEvent, useState } from "react";
import { toBase64 } from "@/lib/files";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { parseSauce, Tag } from "@/lib/types";
import { Visibility } from "@prisma/client";
import { toTitleCase } from "@/lib/utils";

const SOURCE_NAME = {
  DA: "DeviantArt",
  PIXIV: "Pixiv",
  TWITTER: "Twitter",
  OTHER: "Other URL",
  AUTO: "Auto-detect from URL",
};

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
  const [sauce, setSauce] = useState("");
  const [sauceType, setSauceType] = useState<keyof typeof SOURCE_NAME>("AUTO");
  const [vis, setVis] = useState<Visibility>("PUBLIC");
  const [buttonText, setButtonText] = useState("submit");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setButtonText("creating...");

    createPost.mutate({
      title: name,
      tags: tags
        .split(/\s+/)
        .filter((t) => t)
        .map((t) => {
          const [category, name] = t.split(":");
          // the "as" is just to get ts to stop yapping LOL
          return Tag.parse({ category, name });
        }),
      images: await Promise.all(pics.map(async (p) => await toBase64(p))),
      sauce: parseSauce(sauceType, sauce),
      visibility: vis,
    });
  };

  return (
    <div className="space-y-2">
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
          placeholder="title..."
          className="block border-2"
        />

        <select
          value={sauceType}
          onChange={(e) => setSauceType(e.target.value as typeof sauceType)}
          className="block"
        >
          {Object.entries(SOURCE_NAME).map(([val, name]) => (
            <option value={val} key={val}>
              {name}
            </option>
          ))}
        </select>

        <input
          value={sauce}
          onChange={(e) => setSauce(e.target.value)}
          placeholder="sauce..."
          className="block border-2"
        />

        <select
          value={vis}
          onChange={(e) => setVis(e.target.value as Visibility)}
          className="block"
        >
          {Object.keys(Visibility).map((v) => (
            <option value={v} key={v}>
              {toTitleCase(v)}
            </option>
          ))}
        </select>

        <button type="submit" className="block border-2 p-0.5">
          {buttonText}
        </button>
      </form>
    </div>
  );
}
