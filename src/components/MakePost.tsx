"use client";

import { PostForm } from "./PostForm";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toBase64 } from "@/lib/files";
import { useState } from "react";
import { RouterOutputs } from "@/trpc/shared";

export function CreatePost() {
  const router = useRouter();

  const [buttonText, setButtonText] = useState("Create");
  const createPost = api.post.create.useMutation({
    onSuccess: (data) => {
      setButtonText("Success!");
      router.push(`/post/${data.id}`);
      router.refresh();
    },
    onError: () => {
      setButtonText("Error...");
    },
  });

  return (
    <PostForm
      onSubmit={async (pd) => {
        setButtonText("Creating...");
        createPost.mutate({
          title: pd.title,
          tags: pd.tags,
          images: await Promise.all(pd.pics.map(async (p) => await toBase64(p))),
          sauce: pd.sauce,
          visibility: pd.vis,
        });
      }}
      buttonText={buttonText}
    />
  );
}

export function EditPost({
  pid,
  initPost,
}: {
  pid: string;
  initPost?: RouterOutputs["post"]["get"];
}) {
  const router = useRouter();
  const { data: post } = api.post.get.useQuery(pid, { initialData: initPost });

  const editPost = api.post.edit.useMutation({
    onSuccess: (data) => {
      setButtonText("Success!");
      router.push(`/post/${data.id}`);
      router.refresh();
    },
    onError: () => setButtonText("Error..."),
  });

  const [buttonText, setButtonText] = useState("Change");
  return (
    post && (
      <PostForm
        iTitle={post.title}
        iTags={post.tags}
        iSauce={{ src: post.src, id: post.artId }}
        onSubmit={async (pd) => {
          setButtonText("Changing...");
          editPost.mutate({
            pid: pid,
            title: pd.title,
            sauce: pd.sauce,
            tags: pd.tags,
          });
        }}
        buttonText={buttonText}
        fields={{
          pics: false,
          vis: false,
          resetButton: false,
        }}
      />
    )
  );
}
