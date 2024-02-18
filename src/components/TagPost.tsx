"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { parseTag } from "@/lib/types";

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
          return parseTag(name!, category);
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
