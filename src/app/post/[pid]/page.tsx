import { api } from "@/trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";
import Link from "next/link";
import { cn, sauceUrl, serverFetch } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { CommentInput, CommentList } from "@/components/Comment";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { DeletePost } from "@/components/DeletePost";
import { AddTagForm } from "@/components/TagForm";
import { TagList } from "@/components/TagList";
import { LikeButton } from "@/components/LikeButton";

export default async function PostView({
  params: { pid },
}: {
  params: { pid: string };
}) {
  const ret = await serverFetch(async () => await api.post.get(pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val;

  const { userId } = auth();

  const author = post.userId && (await api.user.profileByUid(post.userId));
  const isMod = await api.user.isMod();
  const liked = await api.post.isLiked(pid);
  const src = sauceUrl(post.src, post.artId);
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={20} className="min-w-48 max-w-2xl space-y-10 p-5">
        <Collapsible defaultOpen className="mb-2">
          <div className="flex items-center justify-between rounded border-2 border-gray-200">
            <h2 className="category mx-2">posted by</h2>
            <CollapsibleTrigger className="" asChild>
              <Button variant="ghost" size="sm">
                <CaretSortIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <Button variant="link" size="default" className="subtext">
              {author ? (
                <Link href={`/account/${author.username}`}>{author.username}</Link>
              ) : (
                "a deleted user"
              )}
            </Button>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen className="mb-2">
          <div className="flex items-center justify-between rounded border-2 border-gray-200">
            <h2 className="category mx-2">source</h2>
            <CollapsibleTrigger className="" asChild>
              <Button variant="ghost" size="sm">
                <CaretSortIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <Button variant="link" size="default" className="subtext">
              {src ? <Link href={src[1]}>{src[0]}</Link> : "no source."}
            </Button>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen className="mb-2">
          <div className="flex items-center justify-between rounded border-2 border-gray-200">
            <h2 className="category mx-2">tags</h2>
            <CollapsibleTrigger className="" asChild>
              <Button variant="ghost" size="sm">
                <CaretSortIcon className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <TagList tags={post.tags} />
            <div className="ml-2">
              Don't see a tag? <AddTagForm pid={pid} buttonText="Add it!" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div>
          <h1>Add to Album</h1>
          {userId && <AddToAlbum pid={pid} />}
        </div>

        <div className="space-y-3">
          <h1>Comments</h1>
          <CommentList comments={post.comments} />
          {userId && <CommentInput pid={pid} />}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      {/* why the hell do i have to pass overflow-y-auto in both */}
      <ResizablePanel className="overflow-y-auto p-5" style={{ overflow: "y-auto" }}>
        <div
          className={cn("flex items-center", { "space-x-4": post.userId !== userId })}
        >
          <h1>{post.title}</h1>
          {post.userId === userId && (
            <Button variant="link">
              <Link href={`/post/${pid}/edit`}>edit</Link>
            </Button>
          )}
          <LikeButton pid={pid} liked={liked} />
          {post.userId !== userId && isMod && <DeletePost pid={pid} />}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4 space-x-2">
          {post.images.map((u, ind) => (
            <Image
              key={u.id}
              className="h-auto w-full"
              src={u.rawImg}
              alt={`picture number ${ind + 1}`}
              width={0}
              height={0}
              priority
              unoptimized
            />
          ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
