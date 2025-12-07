"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { SignedIn, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
  // hm you'd think this would be undefined for a lil @ the start but it actually isn't
  const { userId } = useAuth();
  const [photoRows, setPhotoRows] = useState<
    { startIndex: number; endIndex: number }[]
  >([]);
  const [photoDimensions, setPhotoDimensions] = useState<{
    [id: string]: { width: number; height: number };
  }>({});
  const [waitingMessage, setWaitingMessage] = useState("Loading Images...");

  useEffect(() => {
    (async () => {
      const dimensions: {
        [id: string]: { width: number; height: number };
      } = {};
      await Promise.all(
        posts.map(async (photo) => {
          let tries = 100;
          let completed = false;
          while (tries > 0 && !completed) {
            try {
              const img = document.createElement("img");
              img.src = photo.images[0]!.miniImg;
              await img.decode();
              dimensions[photo.id] = {
                width: img.width,
                height: img.height,
              };
              completed = true;
            } catch (error) {
              tries--;
            }
          }
          if (!completed) {
            dimensions[photo.id] = {
              width: 500,
              height: 500,
            };
          }
        }),
      );

      const MAX_WIDTH = window.innerWidth;
      const MAX_HEIGHT = 300;

      let currWidth = 0;
      let start = 0;
      const rows: { startIndex: number; endIndex: number }[] = [];
      posts.map((photo, index) => {
        const width = dimensions[photo.id]!.width;
        const height = dimensions[photo.id]!.height;
        const scale = MAX_HEIGHT / height;

        currWidth += width * scale;
        if (currWidth >= MAX_WIDTH || index == Object.keys(dimensions).length - 1) {
          const totalScale = MAX_WIDTH / currWidth;

          for (let i = start; i <= index; i++) {
            const id = posts[i].id;
            dimensions[id] = {
              height: dimensions[id]!.height * totalScale,
              width: dimensions[id]!.width * totalScale,
            };
          }

          rows.push({
            startIndex: start,
            endIndex: index + 1,
          });
          currWidth = 0;
          start = index + 1;
        }
      });

      setPhotoRows(rows);
      setPhotoDimensions(dimensions);

      console.log("are we done yet");

      const msg = rows.length == 0 ? "No images found." : "";
      setWaitingMessage(msg);
    })();
  }, [posts]);

  if (posts.length === 0) {
    return <div>There don't seem to be any posts here...</div>;
  }

  return (
    <div>
      {waitingMessage ? (
        <div>{waitingMessage}</div>
      ) : (
        <div className="grid border-2 border-solid border-black">
          {photoRows.map((range, index) => (
            <div className="flex" key={index}>
              {posts.slice(range.startIndex, range.endIndex).map((p) => (
                <div key={p.id} className="group relative flex flex-col">
                  <Link href={`/post/${p.id}`}>
                    <Image
                      key={p.id}
                      src={p.images[0]!.miniImg}
                      alt="post preview"
                      width={photoDimensions[p.id]?.width || 250}
                      height={photoDimensions[p.id]?.height || 250}
                      className="h-[300px] opacity-100 group-hover:opacity-75"
                      style={{ width: "auto" }}
                    />
                  </Link>
                  <div className="popup absolute right-0 left-0 opacity-0 group-hover:opacity-100">
                    <div className="bg-opacity-50 bg-white p-2">
                      <p>{`${p.title}`}</p>
                    </div>
                  </div>
                  <SignedIn>
                    <div className="popup absolute bottom-0 left-0 opacity-0 group-hover:opacity-100">
                      {likeButton && (
                        <LikeButton
                          pid={p.id}
                          liked={p.likes!.some((i) => i.userId === userId)}
                        />
                      )}
                    </div>
                  </SignedIn>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
