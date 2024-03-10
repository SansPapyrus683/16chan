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
        <Collapsible defaultOpen className="mb-2">
          <div className="flex justify-between items-center rounded border-2 border-gray-200">
            <h2 className="category mx-2">posted by</h2>
              <CollapsibleTrigger className="" asChild>
                <Button variant="ghost" size="sm">
                  <CaretSortIcon className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <Button variant="link" size="default" className="subtext">
              {author ? ( <Link href={`/account/${author.username}`}>{author.username}</Link>)
                : ( "a deleted user" )}
            </Button>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen className="mb-2">
          <div className="flex justify-between items-center rounded border-2 border-gray-200">
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
          <div className="flex justify-between items-center rounded border-2 border-gray-200">
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

function TagsList({ tags }: { tags: { postId: string, taggedAt: Date, tagName: string, tagCat: string }[]}) {
  let tag_types = ['LOCATION', 'OTHER'];
  let tags_map: { [key: string]: any } = {};

  for (const tag of tags) {
    if (tags_map[tag.tagCat]) {
      tags_map[tag.tagCat].push(tag.tagName);
    }
    else {
      tags_map[tag.tagCat] = [tag.tagName];
    }
  }
  
  return (
    <div className="m-2">
      {Object.keys(tags_map).map((type: string) =>
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="px-2 py-0 h-auto text-base text-gray-500">
              {type}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-4 mb-2 text-gray-400">
              {tags_map[type].map((t: string) =>
                <li key={t}>{t}</li>
              )}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
