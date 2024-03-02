import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { Prisma, Visibility } from "@prisma/client";
import {
  albumPages,
  findUser,
  likePages,
  PageSize,
  postPages,
  prismaOrder,
} from "@/lib/db";
import SortOrder = Prisma.SortOrder;

export const userProfileRouter = createRouter({
  profileByUsername: publicProcedure.input(z.string()).query(async ({ input }) => {
    const userList = await clerkClient.users.getUserList({ username: [input] });
    if (userList.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `no user exists with the handle ${input}`,
      });
    } else if (userList.length > 1) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "wth i thought users couldn't share usernames",
      });
    }
    return userList[0]!;
  }),
  profileByUid: publicProcedure.input(z.string()).query(async ({ input }) => {
    try {
      return await clerkClient.users.getUser(input);
    } catch (e) {
      if ((e as { status: any })?.status === 404) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `the user ${input} doesn't exist`,
        });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(e) });
    }
  }),
  userPosts: publicProcedure
    .input(
      z.object({
        user: z.string(),
        sortBy: z.enum(["new", "likes", "alpha"]).default("new"),
        limit: PageSize,
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = input.user; // just a shorthand
      await findUser(ctx, id);

      const params = {
        where: { userId: id },
        orderBy: prismaOrder(input.sortBy),
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };
      return postPages(ctx, params, input.limit);
    }),
  userLikes: publicProcedure
    .input(
      z.object({
        user: z.string(),
        limit: PageSize,
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = input.user;
      await findUser(ctx, id);

      const params = {
        where: { userId: id },
        orderBy: { likedAt: SortOrder.desc },
        cursor: input.cursor
          ? {
              liking: {
                postId: input.cursor,
                userId: id,
              },
            }
          : undefined,
      };
      return likePages(ctx, params, input.limit, ctx.auth.userId == id);
    }),
  userAlbums: publicProcedure
    .input(
      z.object({
        user: z.string(),
        sortBy: z.enum(["new", "alpha"]).default("new"),
        limit: PageSize,
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const id = input.user;
      await findUser(ctx, id);

      const params = {
        where: {
          userId: id,
          OR: [
            { visibility: Visibility.PUBLIC },
            ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
            ...(id === ctx.auth.userId ? [{ visibility: Visibility.UNLISTED }] : []),
          ],
        },
        orderBy: prismaOrder(input.sortBy),
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };

      return albumPages(ctx, params, input.limit);
    }),
});
