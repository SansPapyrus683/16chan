import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DeletePost } from "@/components/DeletePost";
import { EditPost } from "@/components/MakePost";
import { serialize, serverFetch } from "@/lib/utils";

export default async function PostEditing({ params }: { params: Promise<{ pid: string }> }) {
  const pid = (await params).pid;
  const ret = await serverFetch(async () => await api.post.get(pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val!;

  const { userId } = await auth();
  if (post.userId !== userId) {
    return redirect(`/post/${pid}`);
  }

  return (
    <div className="mx-[30%] min-w-[50%] space-y-4">
      <h1>Editing Post #{pid}</h1>
      <EditPost pid={pid} initPost={serialize(post)} />
      <DeletePost pid={pid} />
    </div>
  );
}
