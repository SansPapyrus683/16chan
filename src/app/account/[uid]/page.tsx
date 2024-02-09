"use client";

import { UserButton } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { type FormEvent, useState } from "react";
import { toBase64 } from "@/lib/files";

export default function Account({ params }: { params: { uid: string } }) {
  const createPost = api.post.create.useMutation();
  const deletePost = api.post.delete.useMutation();
  const likePost = api.post.like.useMutation();
  const { data: profile } = api.user.profile.useQuery(params.uid);
  const { data: posts } = api.user.userPosts.useQuery({ user: params.uid });

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
      <UserButton />
      <div>
        account page for user {profile?.username}
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
      <br />
      <div>
        <ul>
          {(posts ?? []).map((v) => (
            <li key={v.id}>
              <a href={`/post/${v.id}`}>{v.title}</a> |{" "}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  deletePost.mutate(v.id);
                }}
                className="border-2"
              >
                delete
              </button>{" "}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  likePost.mutate(v.id);
                }}
                className="border-2"
              >
                like
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
