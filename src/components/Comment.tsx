"use client";

import type { Comment } from "@prisma/client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { data: user, isLoading } = api.user.profileByUid.useQuery(
    comment.userId ?? "",
    { retry: 1 },
  );
  return (
    <div className="flex justify-between">
      <div>{comment.text}</div>
      {!isLoading && <div>~ by {user?.username ?? "a deleted user"}</div>}
    </div>
  );
}

export function CommentInput({ pid }: { pid: string }) {
  const router = useRouter();
  const comment = api.comment.create.useMutation({
    onSuccess: () => {
      setButtonText("Add comment!");
      router.refresh();
    },
  });
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("Add comment!");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setText("");
    setButtonText("Commenting...");
    comment.mutate({ post: pid, text });
  };

  return (
    <form onSubmit={onSubmit} className="flex justify-between">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Comment..."
        className="max-w-[50%]"
      />
      <Button type="submit">{buttonText}</Button>
    </form>
  );
}
