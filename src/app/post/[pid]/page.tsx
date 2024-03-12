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
import { TagCategory } from "@prisma/client";
import { DeletePost } from "@/components/DeletePost";

export default async function PostView({ params }: { params: { pid: string } }) {
  const ret = await serverFetch(async () => await api.post.get(params.pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val;

  const { userId } = auth();

  const author = post.userId && (await api.user.profileByUid(post.userId));
  const isMod = await api.user.isMod();
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
            <TagsList tags={post.tags} />
          </CollapsibleContent>
        </Collapsible>

        <div>
          <h1>Add to Album</h1>
          {userId && <AddToAlbum pid={params.pid} />}
        </div>
        <div>
          <h1>Comments</h1>
          <CommentList comments={post.comments} />
          {userId && <CommentInput pid={params.pid} />}
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
              <Link href={`/post/${params.pid}/edit`}>edit</Link>
            </Button>
          )}
          {post.userId !== userId && isMod && <DeletePost pid={params.pid} />}
        </div>
        <div className="mt-2 flex space-x-2">
          {post.images.map((u, ind) => (
            <Image
              key={u.id}
              className="w-auto"
              src={u.rawImg}
              alt={`picture number ${ind + 1}`}
              width={200}
              height="0"
              sizes="20vw"
              style={{ width: "30%", height: "10%" }}
              priority
              unoptimized
            />
          ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function TagsList({
  tags,
}: {
  tags: { postId: string; taggedAt: Date; tagName: string; tagCat: string }[];
}) {
  const tagsMap: { [key: string]: string[] } = {};
  for (const cat of Object.keys(TagCategory)) {
    tagsMap[cat] = [];
  }
  tags.forEach(({ tagCat, tagName }) => tagsMap[tagCat]!.push(tagName));

  return (
    <div className="m-2">
      {Object.entries(tagsMap).map(
        ([cat, tags]) =>
          tags.length > 0 && (
            <Collapsible defaultOpen key={cat}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto px-2 py-0 text-base text-gray-500"
                >
                  {cat}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mb-2 ml-4">
                  {tagsMap[cat]!.map((t: string) => (
                    <li key={t}>
                      <Link
                        href={`/?${new URLSearchParams([["q", `tag:${t}`]])}`}
                        className="hover:underline"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ),
      )}
    </div>
  );
}
