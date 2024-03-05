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
  const [photoDimensions, setPhotoDimensions] = useState<{
    [id: string]: { width?: number; height?: number };
  }>({});

  useEffect(() => {
    const fetchPhotoDimensions = async () => {
      let count: number = 0;
      const dimensions: { [id: string]: { width?: number; height?: number } } = {};
      const track_photos: {
        [num: number]: { id?: string; width?: number; height?: number };
      } = {};
      await Promise.all(
        posts.map(async (photo) => {
          try {
            const img = document.createElement("img");
            img.src = photo.images[0]!.img;
            await img.decode();
            dimensions[photo.id] = { width: img.width, height: img.height };
            track_photos[count] = {
              id: photo.id,
              width: img.width,
              height: img.height,
            };
            count = count + 1;
          } catch (error) {
            console.error(`Error loading image: ${photo.id}`, error);
          }
        }),
      );

      const MAX_WIDTH = window.innerWidth;
      let currWidthPixelCount: number = 0;
      let currHeightPixelCount: number = 0;
      let backLog: number = 0;

      for (let i = 0; i < Object.keys(dimensions).length; i++) {
        const width = track_photos[i]?.width;
        const height = track_photos[i]?.height;
        if (width != undefined && height != undefined) {
          currWidthPixelCount += width;
          currHeightPixelCount += height;
          backLog++;
        }
        if (currWidthPixelCount >= MAX_WIDTH) {
          for (let j = 0; j < backLog; j++) {
            let chosenHeight = currHeightPixelCount / backLog;
            const id = track_photos[i - j]?.id;
            if (id !== undefined && dimensions[id] !== undefined) {
              const oldDimensions = dimensions[id];
              if (
                oldDimensions?.height !== undefined &&
                oldDimensions?.width !== undefined
              ) {
                const scaleFactor = oldDimensions.height / chosenHeight;
                dimensions[id] = {
                  ...oldDimensions,
                  height: oldDimensions.height * scaleFactor,
                  width: oldDimensions.width * scaleFactor,
                };
                console.log(`resized ${id} to ${scaleFactor}`);
              }
            }
          }
          currWidthPixelCount = 0;
          currHeightPixelCount = 0;
          backLog = 0;
        }
      }

      setPhotoDimensions(dimensions);
    };
    fetchPhotoDimensions();
  }, [posts]);

  return (
    <div>
      {Object.keys(photoDimensions).length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-col">
              <Link href={`/post/${p.id}`}>
                <Image
                  key={p.id}
                  className="w-auto"
                  src={p.images[0]!.img}
                  alt="post preview"
                  width={photoDimensions[p.id]?.width || 300}
                  height={photoDimensions[p.id]?.height || 300}
                />
              </Link>
              <Link href={`/post/${p.id}`}>{p.title}</Link>
              {p.id}
              {likeButton && (
                <LikeButton
                  pid={p.id}
                  liked={p.likes!.some((i) => i.userId === userId)}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Loading Images...</p>
      )}
    </div>
  );
}
