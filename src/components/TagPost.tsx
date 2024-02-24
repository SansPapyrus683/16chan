"use client";

import { useState } from "react";
import { Tag } from "@/lib/types";
import { api } from "@/trpc/react";

export function TagPost({ pid }: { pid: string }) {
  const [tag, setTag] = useState("");

  const utils = api.useUtils();
  const tagPost = api.post.tag.useMutation({
    onSuccess: () => {
      utils.post.get.invalidate(pid);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const tagList = tag.split(/\s+/).map((t) => {
          const [category, name] = t.split(":");
          return Tag.parse({ category, name });
        });
        tagPost.mutate({ post: pid, tags: tagList });
      }}
    >
      <input onChange={(e) => setTag(e.target.value)} className="border" />
      <button type="submit" className="border-2">
        tag post
      </button>
    </form>
  );
}
