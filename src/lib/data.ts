import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { Visibility } from "@prisma/client";
import { s3Retrieve } from "@/lib/s3";
import { Context } from "@/server/api/trpc";

export async function findPost(
  ctx: { db: Context["db"] },
  postId: string,
  includeImg: boolean = true,
  mustExist: boolean = true,
) {
  const post = await ctx.db.post.findUnique({
    where: { id: postId },
    include: { images: includeImg },
  });
  if (post === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `post w/ id ${postId} not found`,
    });
  }
  if (post !== null && includeImg) {
    post.images = await Promise.all(
      post!.images.map(async (i) => ({ ...i, img: await s3Retrieve(i.img) })),
    );
  }
  return post;
}

export async function findAlbum(
  ctx: { db: Context["db"] },
  albumId: string,
  includePosts: boolean = true,
  mustExist: boolean = true,
) {
  const album = await ctx.db.album.findUnique({
    where: { id: albumId },
    include: { posts: { include: { post: includePosts } } },
  });
  if (album === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `album w/ id ${albumId} not found`,
    });
  }
  return album;
}

export async function findUser(
  ctx: { db: Context["db"] },
  uid: string,
  mustExist: boolean = true,
) {
  const user = ctx.db.user.findUnique({ where: { id: uid } });
  if (user === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `user w/ id ${uid} not found`,
    });
  }
  return user;
}

export function checkPerms(
  post: { visibility: Visibility; userId: string | null },
  userId: string | null,
  type: "view" | "change",
) {
  let hasPerms;
  switch (type) {
    case "view":
      hasPerms = post.visibility !== Visibility.PRIVATE || userId === post.userId;
      break;
    case "change":
      hasPerms = userId === post.userId;
      break;
  }
  if (!hasPerms) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "you don't have the permissions to execute this action.",
    });
  }
}
