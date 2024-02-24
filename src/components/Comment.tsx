"use client";

import { Comment } from "@prisma/client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>
          <Comment comment={c} />
        </li>
      ))}
    </ul>
  );
}

export function Comment({ comment }: { comment: Comment }) {
  return <div>{comment.text}</div>;
}

export function CommentInput({ pid }: { pid: string }) {
  const router = useRouter();
  const comment = api.comment.create.useMutation({
    onSuccess: () => {
      setButtonText("add comment!");
      router.refresh();
    },
  });
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("add comment!");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setText("");
    setButtonText("commenting...");
    comment.mutate({ post: pid, text });
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border"
      />
      <button type="submit" className="block">
        {buttonText}
      </button>
    </form>
  );
}
