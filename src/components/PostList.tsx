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
  const [photoRows, setPhotoRows] = useState<{
    [num: string]: { startIndex?: number; endIndex?: number; height?: number };
  }>({});
  const [photoDimensions, setPhotoDimensions] = useState<{
    [id: string]: { width?: number; height?: number };
  }>({});
  const [waitingMessage, setWaitingMessage] = useState("Loading Images...");

  useEffect(() => {
    const fetchPhotoDimensions = async () => {
      const dimensions: {
        [id: string]: { width: number; height: number };
      } = {};
      const retPhotoRows: {
        [num: number]: { startIndex?: number; endIndex?: number };
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

      let currWidthPixelCount = 0;
      let currHeightPixelCount = 0;
      let backLog = 0;
      let rowCount = 0;
      let start = 0;
      let imagesInRow: string[] = [];
      posts.map((photo, index) => {
        let width = dimensions[photo.id]!.width;
        let height = dimensions[photo.id]!.height;
        let scale_factor: number;
        scale_factor = MAX_HEIGHT / height;
        currWidthPixelCount += width * scale_factor;
        currHeightPixelCount += height * scale_factor;
        imagesInRow.push(photo.id);
        backLog++;
        if (
          (currWidthPixelCount >= MAX_WIDTH && backLog >= 4) ||
          index == Object.keys(dimensions).length - 1
        ) {
          let widthScaleFactor: number = 0.0;
          if (currWidthPixelCount <= MAX_WIDTH) {
            widthScaleFactor = 1.0;
          } else widthScaleFactor = MAX_WIDTH / currWidthPixelCount;
          let new_height = widthScaleFactor * (height * scale_factor);
          imagesInRow.forEach((imageID) => {
            dimensions[imageID] = {
              height: new_height,
              width:
                dimensions[imageID]!.width *
                (MAX_HEIGHT / dimensions[imageID]!.height) *
                widthScaleFactor,
            };
          });
          retPhotoRows[rowCount] = {
            startIndex: start,
            endIndex: start + backLog,
          };
          currWidthPixelCount = 0;
          currHeightPixelCount = 0;
          imagesInRow = [];
          start = start + backLog;
          backLog = 0;
          rowCount++;
        }
      });
      setPhotoRows(retPhotoRows);
      setPhotoDimensions(dimensions);
      if (Object.keys(retPhotoRows).length == 0) setWaitingMessage("No images found.");
    };
    fetchPhotoDimensions();
  }, [posts]);

  if (posts.length === 0) {
    return <div>There don't seem to be any posts here...</div>;
  }

  return (
    <div>
      {Object.keys(photoRows).length > 0 && Object.keys(photoDimensions).length > 0 ? (
        <div className="grid border-2 border-solid border-black">
          {Object.keys(photoRows).map((index) => (
            <div className="flex" key={index}>
              {posts
                .slice(photoRows[index]!.startIndex, photoRows[index]!.endIndex)
                .map((p) => (
                  <div key={p.id} className="group relative flex flex-col">
                    <Link href={`/post/${p.id}`}>
                      <Image
                        key={p.id}
                        src={p.images[0]!.miniImg}
                        alt="post preview"
                        width={photoDimensions[p.id]?.width || 250}
                        height={photoDimensions[p.id]?.height || 250}
                        className="opacity-100 group-hover:opacity-75"
                      />
                    </Link>
                    <div className="popup absolute left-0 right-0 opacity-0 group-hover:opacity-100">
                      <div className="bg-white bg-opacity-50 p-2">
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
      ) : (
        <p>{`${waitingMessage}`}</p>
      )}
    </div>
  );
}
