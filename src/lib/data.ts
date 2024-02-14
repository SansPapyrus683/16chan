import { db } from "@/server/db";
import { TRPCError } from "@trpc/server";
import { Visibility } from "@prisma/client";

export async function findPost(
  postId: string,
  includeImg: boolean = true,
  mustExist: boolean = true,
) {
  const post = await db.post.findUnique({
    where: { id: postId },
    include: { images: includeImg },
  });
  if (post === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `post w/ id ${postId} not found`,
    });
  }
  return post;
}

export async function findAlbum(
  albumId: string,
  includePosts: boolean = true,
  mustExist: boolean = true,
) {
  const album = await db.album.findUnique({
    where: { id: albumId },
    include: { posts: includePosts },
  });
  if (album === null && mustExist) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `album w/ id ${albumId} not found`,
    });
  }
  return album;
}

export async function findUser(uid: string, mustExist: boolean = true) {
  const user = db.user.findUnique({ where: { id: uid } });
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
      code: "UNAUTHORIZED",
      message: "you don't have the permissions to execute this action.",
    });
  }
}
