import { TRPCError } from "@trpc/server";
import { s3RawUrl } from "@/lib/s3";
import { Context } from "@/server/api/trpc";
import { db } from "@/server/db";

export async function findPost(
  ctx: { db: Context["db"] },
  postId: string,
  includeImg: boolean = true,
  mustExist: boolean = true,
) {
  const post = await ctx.db.post.findUnique({
    where: { id: postId },
    include: { images: includeImg, tags: true },
  });
  if (post === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `post w/ id ${postId} not found`,
    });
  }
  if (post !== null && includeImg) {
    post.images = post.images.map((i) => ({ ...i, img: s3RawUrl(i.img) }));
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
      posts: {
        include: { post: { include: { images: includePosts } } },
        orderBy: { addedAt: "desc" },
      },
    },
  });
  if (album !== null && includePosts) {
    for (const p of album.posts) {
      p.post.images = p.post.images.map((i) => ({ ...i, img: s3RawUrl(i.img) }));
    }
  }

  if (album === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `album w/ id ${albumId} not found`,
    });
  }
  return album;
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

export async function getFollowing(ctx: Context) {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "not logged in",
    });
  }
  return db.userFollowing.findMany({ where: { followerId: ctx.auth.userId! } });
}
