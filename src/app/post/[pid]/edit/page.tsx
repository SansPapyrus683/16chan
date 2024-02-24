import { api } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DeletePost } from "@/components/DeletePost";
import { EditPost } from "@/components/MakePost";

export default async function PostEditing({ params }: { params: { pid: string } }) {
  const post = await api.post.get(params.pid);
  if (post === null) {
    notFound();
  }
  const { userId } = auth();
  if (post.userId !== userId) {
    return redirect(`/post/${params.pid}`);
  }

  return (
    <div className="space-y-4">
      <h1>edit post {params.pid} here</h1>
      <EditPost pid={params.pid} />
      <DeletePost pid={params.pid} />
    </div>
  );
}
