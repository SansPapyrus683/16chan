import { TRPCError } from "@trpc/server";
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
    include: {
      posts: { include: { post: includePosts }, orderBy: { addedAt: "desc" } },
    },
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

export async function isMod(ctx: { db: Context["db"]; auth: Context["auth"] }) {
  const user = await ctx.db.user.findUnique({ where: { id: ctx.auth.userId! } });
  return user === null ? false : user.isMod;
}

export async function findComment(
  ctx: { db: Context["db"] },
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