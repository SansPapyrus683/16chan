import { TRPCError } from "@trpc/server";
import { Context } from "@/server/api/trpc";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export async function findPost(
  ctx: Context,
  postId: string,
  mustExist: boolean = true,
  include: Prisma.PostInclude = {},
) {
  const post = await ctx.db.post.findUnique({
    where: { id: postId },
    include: include,
  });

  if (post === null) {
    if (mustExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `post w/ id ${postId} not found`,
      });
    }
    return null;
  }
  return post;
}

export async function findAlbum(
  ctx: Context,
  albumId: string,
  mustExist: boolean = true,
  include: Prisma.PostInclude = {},
) {
  const album = await ctx.db.album.findUnique({
    where: { id: albumId },
    include: {
      posts: {
        include: { post: { include } },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (album === null) {
    if (mustExist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `album w/ id ${albumId} not found`,
      });
    }
    return null;
  }

  return album;
}

export async function findComment(
  ctx: Context,
  commentId: string,
  mustExist: boolean = true,
) {
  const comm = await ctx.db.comment.findUnique({
    where: { id: commentId },
  });
  if (comm === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `comment w/ id ${commentId} not found`,
    });
  }
  return comm;
}

export async function findUser(ctx: Context, uid: string, mustExist: boolean = true) {
  const user = ctx.db.user.findUnique({ where: { id: uid } });
  if (user === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `user w/ id ${uid} not found`,
    });
  }
  return user;
}

export async function isMod(ctx: Context, userId: string | undefined = undefined) {
  const id = userId || ctx.auth.userId!;
  const user = await ctx.db.user.findUnique({ where: { id } });
  return user === null ? false : user.isMod;
}

export async function getFollowing(ctx: Context) {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "not logged in",
    });
  }
  return db.userFollowing.findMany({ where: { followerId: ctx.auth.userId! } });
}
