import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { albumPages, PageSize, postPages } from "@/lib/pages";
import { Visibility } from "@prisma/client";
import { findUser, prismaOrder } from "@/lib/db";

export const userProfileRouter = createRouter({
  profile: publicProcedure.input(z.string()).query(async ({ input }) => {
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
  userPosts: publicProcedure
    .input(
      z
        .object({
          user: z.string().optional(),
          what: z.enum(["posts", "likes"]).default("posts"),
          sortBy: z.enum(["new", "likes", "alpha"]).default("new"),
          limit: PageSize,
          cursor: z.string().uuid().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const id = input.user ?? ctx.auth.userId;
      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "you need to provide a user id or be logged in",
        });
      }
      await findUser(ctx, id);

      let what;
      switch (input.what) {
        case "posts":
          what = { userId: id };
          break;
        case "likes":
          what = { likes: { some: { userId: id } } };
          break;
      }

      const params = {
        where: {
          ...what,
          OR: [
            { visibility: Visibility.PUBLIC },
            ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
            ...(input.what === "likes" && id === ctx.auth.userId
              ? [{ visibility: Visibility.UNLISTED }]
              : []),
          ],
        },
        orderBy: prismaOrder(input.sortBy),
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };

      return postPages(ctx, params, { include: { images: true } }, input.limit);
    }),
  userAlbums: publicProcedure
    .input(
      z
        .object({
          user: z.string().optional(),
          sortBy: z.enum(["new", "alpha"]).default("new"),
          limit: PageSize,
          cursor: z.string().uuid().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const id = input.user ?? ctx.auth.userId;
      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "you need to provide a user id or be logged in",
        });
      }
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

      return albumPages(ctx, params, { include: { posts: true } }, input.limit);
    }),
});
