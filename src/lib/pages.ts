import { z } from "zod";
import { env } from "@/env";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export const PageSize = z.number().min(1).max(1000).default(env.NEXT_PUBLIC_PAGE_SIZE);

export async function postPages(
  params: Prisma.User$postsArgs,
  takeParams: Prisma.User$postsArgs,
  limit: z.infer<typeof PageSize>,
) {
  const posts = await db.post.findMany({
    take: limit + 1,
    ...params,
    ...takeParams,
  });
  const nextCursor =
    posts.length > env.NEXT_PUBLIC_PAGE_SIZE ? posts.pop()!.id : undefined;

  const prevPosts = await db.post.findMany({
    take: -limit - 1,
    ...params,
  });
  let prevCursor = prevPosts.length >= 1 ? prevPosts[0]!.id : undefined;

  console.log(posts);
  return {
    posts,
    prevCursor,
    nextCursor,
  };
}

export async function albumPages(
  params: Prisma.User$albumsArgs,
  takeParams: Prisma.User$albumsArgs,
  limit: z.infer<typeof PageSize>,
) {
  const albums = await db.album.findMany({
    take: limit + 1,
    ...params,
    ...takeParams,
  });
  const nextCursor =
    albums.length > env.NEXT_PUBLIC_PAGE_SIZE ? albums.pop()!.id : undefined;

  const prevPosts = await db.album.findMany({
    take: -limit - 1,
    ...params,
  });
  let prevCursor = prevPosts.length >= 1 ? prevPosts[0]!.id : undefined;

  return {
    albums,
    prevCursor,
    nextCursor,
  };
}
