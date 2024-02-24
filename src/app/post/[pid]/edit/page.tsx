import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DeletePost } from "@/components/DeletePost";
import { EditPost } from "@/components/MakePost";
import { TRPCError } from "@trpc/server";

export default async function PostEditing({ params }: { params: { pid: string } }) {
  let post;
  let error = null;
  try {
    post = await api.post.get(params.pid);
  } catch (e) {
    error = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code == "NOT_FOUND") {
        notFound();
      } else if (e.code === "FORBIDDEN") {
        error = "you aren't authorized to see this post";
      }
    }
  }
  if (!post) {
    return <div>{error}</div>;
  }

  const { userId } = auth();
  if (post!.userId !== userId) {
    return redirect(`/post/${params.pid}`);
  }

  console.log(post);
  return (
    <div className="space-y-4">
      <h1>edit post {params.pid} here</h1>
      <EditPost pid={params.pid} initPost={post!} />
      <DeletePost pid={params.pid} />
    </div>
  );
}
