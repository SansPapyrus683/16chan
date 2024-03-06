"use client";

import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { useCallback } from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import getImageMetadata from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";
import { useAuth } from "@clerk/nextjs";
import { PhoneNumber } from "@clerk/clerk-sdk-node";

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
  const { data } = query.useQuery(params, { initialData: initPosts, staleTime: 5e3 });

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
      <div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", prevCursor!)}`);
          }}
          disabled={prevCursor === undefined}
          className="border p-1"
        >
          prev
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            router.push(`${pathname}?${modParams("cursor", nextCursor!)}`);
          }}
          className="ml-3 border p-1"
          disabled={nextCursor === undefined}
        >
          next
        </button>
      </div>
    </>
  );
}

interface ImageData {
  url: string;
  width: number;
  height: number;
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
    [num: number]: { startIndex?: number; endIndex?: number; height?: number };
  }>({});
  const [photoDimensions, setPhotoDimensions] = useState<{
    [id: string]: { width?: number; height?: number };
  }>({});

  useEffect(() => {
    const fetchPhotoDimensions = async () => {
      const dimensions: {
        [id: string]: { width?: number; height?: number };
      } = {};
      const retPhotoDimensions: {
        [id: string]: { width?: number; height?: number };
      } = {};
      const retPhotoRows: {
        [num: number]: { startIndex?: number; endIndex?: number };
      } = {};
      await Promise.all(
        posts.map(async (photo) => {
          let tries = 5;
          let completed = false;
          while (tries > 0 && !completed) {
            try {
              const img = document.createElement("img");
              img.src = photo.images[0]!.img;
              await img.decode();
              dimensions[photo.id] = {
                width: img.width,
                height: img.height,
              };
              completed = true;
            } catch (error) {
              console.log(error);
              tries--;
            }
          }
          if (!completed) console.log(`failed to load image ${photo.id}`);
        }),
      );

      const MAX_WIDTH = window.innerWidth;
      const MAX_HEIGHT = 500;

      let currWidthPixelCount: number = 0;
      let currHeightPixelCount: number = 0;
      let backLog: number = 0;
      let rowCount: number = 0;
      let start: number = 0;
      let imagesInRow = [];
      Object.keys(dimensions).map((id) => {
        let width = dimensions[id]?.width;
        let height = dimensions[id]?.height;
        let scale_factor = 0;
        if (width != undefined && height != undefined) {
          scale_factor = MAX_HEIGHT / height;
          currWidthPixelCount += width * scale_factor;
          currHeightPixelCount += height * scale_factor;
          backLog++;
          imagesInRow.push(id);
        }
        if (currWidthPixelCount >= MAX_WIDTH && backLog >= 5) {
          let new_height: number =
            (MAX_WIDTH / currWidthPixelCount) * (height * scale_factor);
          imagesInRow.forEach((imageID) => {
            retPhotoDimensions[imageID] = {
              height: new_height,
              width:
                dimensions[imageID]?.width *
                (MAX_HEIGHT / dimensions[imageID]?.height) *
                (MAX_WIDTH / currWidthPixelCount),
            };
          }),
            (retPhotoRows[rowCount] = {
              startIndex: start,
              endIndex: start + backLog,
            });
          currWidthPixelCount = 0;
          currHeightPixelCount = 0;
          imagesInRow = [];
          start = start + backLog;
          backLog = 0;
          rowCount++;
        }
      }),
        setPhotoRows(retPhotoRows);
      setPhotoDimensions(retPhotoDimensions);
    };
    fetchPhotoDimensions();
  }, [posts]);

  return (
    <div>
      {Object.keys(photoRows).length > 0 && Object.keys(photoDimensions).length > 0 ? (
        <div className="grid">
          {Object.keys(photoRows).map((index) => (
            <div className="flex">
              {posts
                .slice(photoRows[index].startIndex, photoRows[index].endIndex)
                .map((p) => (
                  <div key={p.id} className="flex flex-col">
                    <Link href={`/post/${p.id}`}>
                      <Image
                        key={p.id}
                        src={p.images[0]!.img}
                        alt="post preview"
                        width={photoDimensions[p.id]?.width || 300}
                        height={photoDimensions[p.id]?.height | 300}
                      />
                    </Link>
                    {likeButton && (
                      <LikeButton
                        pid={p.id}
                        liked={p.likes!.some((i) => i.userId === userId)}
                      />
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading Images...</p>
      )}
    </div>
  );
}
