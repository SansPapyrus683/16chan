import { TRPCError } from "@trpc/server";
import { s3RawUrl } from "@/lib/s3";
import { Context } from "@/server/api/trpc";
import { db } from "@/server/db";

type DBContext = { db: Context["db"] };

export async function findPost(
  ctx: DBContext,
  postId: string,
  mustExist: boolean = true,
  include: {
    images?: boolean;
    comments?: boolean;
    tags?: boolean;
  } = {},
) {
  include = {
    images: true,
    tags: true,
    comments: true,
    ...include,
  };
  const post = await ctx.db.post.findUnique({
    where: { id: postId },
    include: include,
  });

  if (post === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `post w/ id ${postId} not found`,
    });
  }

  if (post !== null && include.images) {
    post.images.forEach((i) => (i.img = s3RawUrl(i.img)));
  }
  return post;
}

export async function postExists(ctx: DBContext, postId: string) {}

export async function findAlbum(
  ctx: DBContext,
  albumId: string,
  mustExist: boolean = true,
  include: {
    images?: boolean;
  } = {},
) {
  include = {
    images: true,
    ...include,
  };

  const album = await ctx.db.album.findUnique({
    where: { id: albumId },
    include: {
      posts: {
        include: { post: { include } },
        orderBy: { addedAt: "desc" },
      },
    },
  });
  if (album !== null && include.images) {
    album.posts.forEach((p) => p.post.images.forEach((i) => (i.img = s3RawUrl(i.img))));
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
  ctx: DBContext,
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

export async function findUser(ctx: DBContext, uid: string, mustExist: boolean = true) {
  const user = ctx.db.user.findUnique({ where: { id: uid } });
  if (user === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `user w/ id ${uid} not found`,
    });
  }
  return user;
}

export async function isMod(ctx: DBContext & { auth: Context["auth"] }) {
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
