"use client";
import { type FormEvent, useState } from "react";
import { api } from "@/trpc/react";
import { toBase64 } from "@/lib/files";

export default function Home() {
  const createPost = api.post.create.useMutation();
  const deletePost = api.post.delete.useMutation();
  const { data: posts } = api.user.userPosts.useQuery();

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
    <>
      <div>
        16chan.
        <form onSubmit={onSubmit}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              setPics(Array.from(e.target.files!));
            }}
          />
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button type="submit">submit</button>
        </form>
        <button
          onClick={async (e) => {
            e.preventDefault();
            deletePost.mutate("c3f974b1-40d3-4e88-91e4-9b24afed028f");
          }}
        >
          delete a post
        </button>
      </div>
      <div>
        <ul>
          {(posts ?? []).map((v) => (
            <li key={v.id}>
              {v.title} | {v.images.map((i) => i.img).join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
