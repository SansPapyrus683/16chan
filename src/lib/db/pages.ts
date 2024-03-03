import { z } from "zod";
import { env } from "@/env";
import { Prisma, Visibility } from "@prisma/client";
import { s3Get } from "@/lib/s3";
import { Context } from "@/server/api/trpc";

export const PageSize = z.number().min(1).max(1000).default(env.NEXT_PUBLIC_PAGE_SIZE);

export async function postPages(
  ctx: Context,
  params: {
    where?: Prisma.PostWhereInput;
    cursor?: Prisma.PostWhereUniqueInput;
    orderBy?:
      | Prisma.PostOrderByWithRelationInput
      | Prisma.PostOrderByWithRelationInput[];
  },
  limit: z.infer<typeof PageSize> = env.NEXT_PUBLIC_PAGE_SIZE,
  includeUnlisted: boolean = false,
) {
  const goodVis = [
    Visibility.PUBLIC,
    ...(includeUnlisted ? [Visibility.UNLISTED] : []),
  ];
  params.where = {
    ...params.where,
    OR: [
      { visibility: { in: goodVis } },
      ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
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

  const posts = await ctx.db.post.findMany({
    ...params,
    take: limit + 1,
    include: {
      images: { take: 1, orderBy: { img: "asc" } },
      likes: { where: { userId: ctx.auth.userId ?? "" } },
    },
  });
  for (const p of posts) {
    for (const i of p.images) {
      i.img = await s3Get(i.img);
    }
  }

  const nextCursor =
    posts.length > env.NEXT_PUBLIC_PAGE_SIZE ? posts.pop()!.id : undefined;

  const prevPosts = params.cursor
    ? await ctx.db.post.findMany({
        ...params,
        take: -limit - 1,
      })
    : [];
  const prevCursor = prevPosts.length > 1 ? prevPosts[0]!.id : undefined;

  return {
    posts,
    prevCursor,
    nextCursor,
  };
}

export async function likePages(
  ctx: Context,
  params: {
    where?: Prisma.UserLikesWhereInput;
    cursor?: Prisma.UserLikesWhereUniqueInput;
    orderBy?:
      | Prisma.UserLikesOrderByWithRelationInput
      | Prisma.UserLikesOrderByWithRelationInput[];
  },
  limit: z.infer<typeof PageSize> = env.NEXT_PUBLIC_PAGE_SIZE,
  includeUnlisted: boolean = false,
) {
  const goodVis = [
    Visibility.PUBLIC,
    ...(includeUnlisted ? [Visibility.UNLISTED] : []),
  ];
  params.where = {
    ...params.where,
    OR: [
      { post: { visibility: { in: goodVis } } },
      ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
    ],
  };

  if (params.cursor) {
    const post = await ctx.db.userLikes.findFirst({
      // WHAT THE HELL
      where: { ...params.cursor.liking, ...params.where },
    });
    if (post === null) {
      delete params.cursor;
    }
  }

  const posts = (
    await ctx.db.userLikes.findMany({
      ...params,
      take: limit + 1,
      include: {
        post: {
          include: {
            images: { take: 1, orderBy: { img: "asc" } },
            likes: { where: { userId: ctx.auth.userId ?? "" } },
          },
        },
      },
    })
  ).map((i) => i.post);
  for (const p of posts) {
    for (const i of p.images) {
      i.img = await s3Get(i.img);
    }
  }
  const nextCursor =
    posts.length > env.NEXT_PUBLIC_PAGE_SIZE ? posts.pop()!.id : undefined;

  const prevPosts = params.cursor
    ? await ctx.db.userLikes.findMany({
        ...params,
        take: -limit - 1,
      })
    : [];
  const prevCursor = prevPosts.length > 1 ? prevPosts[0]!.postId : undefined;

  return {
    posts,
    prevCursor,
    nextCursor,
  };
}

export async function albumPages(
  ctx: Context,
  params: {
    where?: Prisma.AlbumWhereInput;
    cursor?: Prisma.AlbumWhereUniqueInput;
    orderBy?:
      | Prisma.AlbumOrderByWithRelationInput
      | Prisma.AlbumOrderByWithRelationInput[];
  },
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
    ...params,
    include: { posts: true },
    take: limit + 1,
  });
  const nextCursor =
    albums.length > env.NEXT_PUBLIC_PAGE_SIZE ? albums.pop()!.id : undefined;

  const prevPosts = await ctx.db.album.findMany({
    ...params,
    take: -limit - 1,
  });
  let prevCursor = prevPosts.length >= 1 ? prevPosts[0]!.id : undefined;

  return {
    albums,
    prevCursor,
    nextCursor,
  };
}
