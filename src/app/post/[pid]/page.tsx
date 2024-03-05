import { api } from "@/trpc/server";
import Image from "next/image";
import { AddToAlbum } from "@/components/AddToAlbum";
import { TagPost } from "@/components/TagPost";
import Link from "next/link";
import { sauceUrl, serverFetch } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { CommentInput, CommentList } from "@/components/Comment";
import { ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup, } from "@/components/ui/resizable"
import { Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger, } from "@/components/ui/accordion"
import { Collapsible,
  CollapsibleContent,
  CollapsibleTrigger, } from "@/components/ui/collapsible"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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
        <Collapsible>
          <div className="flex justify-between items-center">
            <h2 className="category mx-2">posted by:</h2>
              <CollapsibleTrigger className="" asChild>
                <Button variant="ghost" size="sm">
                  <CaretSortIcon className="h-4 w-4" />
                </Button>
              </ CollapsibleTrigger>
          </div>
          <Separator className="my-1"/>
          <CollapsibleContent>
            <Button variant="link" size="sm" className="subtext">
              {author ? ( <Link href={`/account/${author.username}`}>{author.username}</Link>)
                : ( "a deleted user" )}
            </Button>
          </ CollapsibleContent>
        </ Collapsible>
        <Collapsible>
          <CollapsibleTrigger>
            <div className="category">
              source:
            </div>
          </ CollapsibleTrigger>
          <CollapsibleContent>
            <div>source: {src ? <Link href={src[1]}>{src[0]}</Link> : "no source."}</div>
          </ CollapsibleContent>
        </ Collapsible>
        <div>
          tags:{" "}
          {post.tags.length == 0 ? (
            "no tags!"
          ) : (
              <ul>
                {post.tags.map((t) => (
                  <li key={t.tagName}>
                    {t.tagCat}:{t.tagName}
                  </li>
                ))}
              </ul>
            )}
        </div>

        <TagPost pid={params.pid} />
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
        {
          post.userId == userId && (
            <div>
              <Link href={`/post/${params.pid}/edit`}>edit ur post here</Link>
            </div>
          )
        }
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
