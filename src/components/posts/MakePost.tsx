"use client";

import { PostForm } from "./PostForm";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toBase64 } from "@/lib/files";
import { useState } from "react";

export function CreatePost() {
  const router = useRouter();

  const [buttonText, setButtonText] = useState("submit");
  const createPost = api.post.create.useMutation({
    onSuccess: (data) => {
      setButtonText("success!");
      router.push(`/post/${data.id}`);
    },
    onError: () => {
      setButtonText("error...");
    },
  });

  return (
    <PostForm
      onSubmit={async (pd) => {
        createPost.mutate({
          title: pd.title,
          tags: pd.tags,
          images: await Promise.all(pd.pics.map(async (p) => await toBase64(p))),
          sauce: pd.sauce,
          visibility: pd.vis,
        });
      }}
      onParseError={(e) => {
        setButtonText("error...");
      }}
      editVis
      buttonText={buttonText}
    />
  );
}

export function EditPost({ pid }: { pid: string }) {
  const router = useRouter();
  const { data: post } = api.post.get.useQuery(pid);
  if (post === null) {
    return <div>post not found</div>;
  }

  const utils = api.useUtils();
  const editPost = api.post.edit.useMutation({
    onSuccess: (data) => {
      setButtonText("success!");
      utils.post.get.invalidate(pid);
      router.push(`/post/${data.id}`);
    },
    onError: () => {
      setButtonText("error...");
    },
  });

  const [buttonText, setButtonText] = useState("change");
  return (
    post && (
      <PostForm
        iTitle={post.title}
        iTags={post.tags.map((t) => `${t.tagCat}:${t.tagName}`).join(" ")}
        iSauce={{ src: post.src, id: post.artId }}
        onSubmit={async (pd) => {
          editPost.mutate({
            pid: pid,
            title: pd.title,
            sauce: pd.sauce,
            tags: pd.tags,
          });
        }}
        onParseError={(e) => {
          setButtonText("error...");
        }}
        buttonText={buttonText}
      />
    )
  );
}
