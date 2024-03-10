import { api } from "@/trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";
import Link from "next/link";
import { sauceUrl, serverFetch } from "@/lib/utils";
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

export default async function PostView({ params }: { params: { pid: string } }) {
  const ret = await serverFetch(async () => await api.post.get(params.pid));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const post = ret.val;

  const { userId } = auth();

  const author = post.userId && (await api.user.profileByUid(post.userId));
  const src = sauceUrl(post.src, post.artId);
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={20} className="m-2 min-w-48 max-w-2xl">
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

        {/* <TagPost pid={params.pid} /> */}
        <AddToAlbum pid={params.pid} />
        <CommentList comments={post.comments} />
        <CommentInput pid={params.pid} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <div className="title"> {post.title} </div>
        <div className="space-y-2">
          {post.images.map((u, ind) => (
            <Image
              key={u.id}
              className="w-auto"
              src={u.rawImg}
              alt={`picture number ${ind + 1}`}
              width={200}
              height={200}
              priority
            />
          ))}
        </div>
        {post.userId == userId && (
          <div>
            <Link href={`/post/${params.pid}/edit`}>edit ur post here</Link>
          </div>
        )}
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
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto px-2 py-0 text-base text-gray-500"
                >
                  {cat}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mb-2 ml-4 text-gray-400">
                  {tagsMap[cat]!.map((t: string) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ),
      )}
    </div>
  );
}
