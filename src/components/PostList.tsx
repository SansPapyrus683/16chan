"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { SignedIn, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const Masonry = dynamic(() => import("masonic").then((mod) => mod.Masonry), {
  ssr: false,
});

type PostData = RouterOutputs["user"]["userPosts"];

export function PaginatedPostList({
  initPosts,
  getWhat,
  params,
  likeButton = false,
}: {
  initPosts: PostData;
  getWhat: "userPosts" | "userLikes" | "following" | "search";
  params?: object;
  likeButton?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const modParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  let query;
  switch (getWhat) {
    case "userPosts":
      query = api.user.userPosts;
      break;
    case "userLikes":
      query = api.user.userLikes;
      break;
    case "following":
      query = api.user.followedPosts;
      break;
    case "search":
      query = api.browse.browse;
      break;
  }
  //@ts-ignore
  const { data } = query.useQuery(params, { initialData: initPosts });
  const {
    posts,
    prevCursor,
    nextCursor,
  }: {
    posts: PostData["posts"];
    prevCursor: string | undefined;
    nextCursor: string | undefined;
  } = data || {};

  return (
    <>
      <PostList posts={posts} likeButton={likeButton} />
      <br />
      <div className="flex">
        <Button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", prevCursor!)}`);
          }}
          disabled={prevCursor === undefined}
        >
          Prev
        </Button>
        <Button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", nextCursor!)}`);
          }}
          className="ml-3"
          disabled={nextCursor === undefined}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export function PostList({
  posts,
  likeButton = false,
}: {
  posts: PostData["posts"];
  likeButton?: boolean;
}) {
  if (posts.length === 0) {
    return <div>There don't seem to be any posts here...</div>;
  }

  return (
    <div>
      <Masonry
        key={posts[0].id}
        items={posts}
        maxColumnCount={7}
        //@ts-ignore
        itemKey={(p) => p.id}
        render={(p) => (
          <SinglePost
            //@ts-ignore i forgot how awful web dev was
            post={p.data}
            likeButton={likeButton}
            className="group relative mx-1 my-1 flex flex-col"
          />
        )}
      />
    </div>
  );
}

function SinglePost({
  post,
  className,
  likeButton,
}: {
  post: PostData["posts"][0];
  className: string;
  likeButton: boolean;
}) {
  // hm you'd think this would be undefined for a lil @ the start but it actually isn't
  const { userId } = useAuth();
  return (
    <div key={post.id} className={className}>
      <Link href={`/post/${post.id}`}>
        {/* TODO: HOW DO I USE NEXT JS'S IMAGE HERE WTFFFF */}
        <img
          key={post.id}
          src={post.images[0]!.miniImg}
          alt="post preview"
          className="w-full rounded-md opacity-100 group-hover:opacity-75"
        />
      </Link>
      <div className="popup absolute right-0 left-0 border-black bg-gray-300 p-2 opacity-0 group-hover:opacity-100 rounded-t-md">
        {post.title}
      </div>
      <SignedIn>
        <div className="popup absolute bottom-0 left-0 opacity-0 group-hover:opacity-100">
          {likeButton && (
            <LikeButton
              pid={post.id}
              liked={post.likes!.some((i) => i.userId === userId)}
            />
          )}
        </div>
      </SignedIn>
    </div>
  );
}
