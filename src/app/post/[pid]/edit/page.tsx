import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DeletePost } from "@/components/DeletePost";
import { EditPost } from "@/components/MakePost";
import { serverFetch } from "@/lib/utils";

export default async function PostEditing({ params }: { params: { pid: string } }) {
  const ret = await serverFetch(async () => await api.post.get(params.pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val;

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
