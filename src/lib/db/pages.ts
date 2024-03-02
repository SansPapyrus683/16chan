import { z } from "zod";
import { env } from "@/env";
import { Image, Post, Prisma, Visibility } from "@prisma/client";
import { Context } from "@/server/api/trpc";
import { s3Get } from "@/lib/s3";
import { postLiked } from "@/lib/db/data";

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
  if (params.cursor) {
    const post = await ctx.db.post.findFirst({
      where: { ...params.cursor, ...params.where },
    });
    if (post === null) {
      delete params.cursor;
    }
  }

  const rawPosts: (Post & { images?: Image[] })[] = await ctx.db.post.findMany({
    take: limit + 1,
    ...params,
    ...takeParams,
  });
  const posts: (Post & { images?: Image[]; liked: boolean })[] = [];
  for (const p of rawPosts) {
    if (p.images) {
      for (const i of p.images) {
        i.img = await s3Get(i.img);
      }
    }
    posts.push({
      ...p,
      liked: await postLiked(ctx, p.id),
    });
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
  ctx: { db: Context["db"]; auth: Context["auth"] },
  params: Prisma.AlbumFindManyArgs,
  takeParams: Prisma.AlbumFindManyArgs,
  limit: z.infer<typeof PageSize>,
) {
  params.where = {
    ...params.where,
    OR: [
      { visibility: Visibility.PUBLIC },
      ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
    ],
  };
  if (params.cursor) {
    const album = await ctx.db.album.findFirst({
      where: { ...params.cursor, ...params.where },
    });
    if (album === null) {
      delete params.cursor;
    }
  }

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
