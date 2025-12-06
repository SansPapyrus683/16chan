import { api } from "@/trpc/server";
import { PaginatedPostList } from "@/components/PostList";
import { CreateAlbum } from "@/components/CreateAlbum";
import { AlbumList } from "@/components/AlbumList";
import { FollowButton } from "@/components/FollowButton";
import { auth } from "@clerk/nextjs/server";
import { serialize, serverFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Link from "next/link";
import { SignedIn } from "@clerk/nextjs";

export default async function Account({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ cursor: string | string[] | undefined }>;
}) {
  const p = await params;
  const sp = await searchParams;

  const ret = await serverFetch(async () => await api.user.profileByUsername(p.handle));
  if (!ret.good) {
    return <div>{ret.err}</div>;
  }
  const profile = ret.val;

  const { userId } = await auth();

  const cursor = Array.isArray(sp.cursor) ? sp.cursor[0] : sp.cursor;
  const posts = await api.user.userPosts({ user: profile.id, cursor });
  const isFollowing = Boolean(userId && (await api.user.isFollowing(profile.id)));
  const albums = await api.user.userAlbums({ user: profile.id });

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1 space-y-4 space-x-10">
      <ResizablePanel defaultSize={20} className="max-w-2xl min-w-40">
        <div className="space-y-4">
          <div>
            <Avatar className="h-40 w-40 align-middle">
              <AvatarImage src={profile.imageUrl} className="object-cover" />
              <AvatarFallback>`${profile.username}`</AvatarFallback>
            </Avatar>

            <div className="text-size-10 mt-3">{profile.username}</div>
          </div>

          <SignedIn>
            {profile.id !== userId && (
              <FollowButton uid={profile.id} isFollowing={isFollowing} />
            )}
          </SignedIn>

          <div>
            <Button className="w-40 rounded-md border-2 p-0.5 text-center">
              <Link href={`/account/${p.handle}/likes`}>Liked Posts</Link>
            </Button>
          </div>

          {userId === profile.id && (
            <div>
              <CreateAlbum />
            </div>
          )}

          <div>
            <h2>Albums</h2>
            <AlbumList initAlbums={albums} uid={profile.id} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      {/* this is the second time now, what??? */}
      <ResizablePanel className="overflow-y-auto" style={{ overflow: "y-auto" }}>
        <div>
          Posts
          <PaginatedPostList
            getWhat="userPosts"
            initPosts={serialize(posts)}
            params={{ user: profile.id, what: "posts", cursor }}
            likeButton={userId !== null}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
