import { z } from "zod";
import { env } from "@/env";
import { Image, Post, Prisma, Visibility } from "@prisma/client";
import { Context } from "@/server/api/trpc";
import { s3RawUrl } from "@/lib/s3";

export const PageSize = z.number().min(1).max(1000).default(env.NEXT_PUBLIC_PAGE_SIZE);

export async function postPages(
  ctx: { db: Context["db"]; auth: Context["auth"] },
  params: Prisma.PostFindManyArgs,
  takeParams: Prisma.PostFindManyArgs,
  limit: z.infer<typeof PageSize>,
  includeUnlisted: boolean = false,
) {
  params.where = {
    ...params.where,
    OR: [
      { visibility: Visibility.PUBLIC },
      ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
      ...(includeUnlisted ? [{ visibility: Visibility.UNLISTED }] : []),
    ],
  };

  const posts: (Post & { images?: Image[] })[] = await ctx.db.post.findMany({
    take: limit + 1,
    ...params,
    ...takeParams,
  });
  for (const p of posts) {
    if (p.images) {
      p.images.map((i) => ({ ...i, img: s3RawUrl(i.img) }));
    }
  }

  const nextCursor =
    posts.length > env.NEXT_PUBLIC_PAGE_SIZE ? posts.pop()!.id : undefined;

  const prevPosts = params.cursor
    ? await ctx.db.post.findMany({
        take: -limit - 1,
        ...params,
      })
    : [];
  const prevCursor = prevPosts.length > 1 ? prevPosts[0]!.id : undefined;

  return {
    posts,
    prevCursor,
    nextCursor,
  };
}

export async function albumPages(
  ctx: { db: Context["db"] },
  params: Prisma.AlbumFindManyArgs,
  takeParams: Prisma.AlbumFindManyArgs,
  limit: z.infer<typeof PageSize>,
) {
  const albums = await ctx.db.album.findMany({
    take: limit + 1,
    ...params,
    ...takeParams,
  });
  const nextCursor =
    albums.length > env.NEXT_PUBLIC_PAGE_SIZE ? albums.pop()!.id : undefined;

  const prevPosts = await ctx.db.album.findMany({
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
