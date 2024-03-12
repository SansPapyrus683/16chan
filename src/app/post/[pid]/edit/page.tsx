import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DeletePost } from "@/components/DeletePost";
import { EditPost } from "@/components/MakePost";
import { serialize, serverFetch } from "@/lib/utils";

export default async function PostEditing({ params }: { params: { pid: string } }) {
  const ret = await serverFetch(async () => await api.post.get(params.pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val!;

  const { userId } = auth();
  if (post.userId !== userId) {
    return redirect(`/post/${params.pid}`);
  }

  return (
    <div className="mx-[30%] min-w-[50%] space-y-4">
      <h1>Editing Post #{params.pid}</h1>
      <EditPost pid={params.pid} initPost={serialize(post)} />
      <DeletePost pid={params.pid} />
    </div>
  );
}
