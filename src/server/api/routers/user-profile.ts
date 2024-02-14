import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { albumPages, PageSize, postPages } from "@/lib/pages";
import { Visibility } from "@prisma/client";
import { findUser } from "@/lib/data";

function prismaOrder(order: "date" | "likes" | "alpha") {
  const ret: {
    createdAt?: "desc";
    likes?: { _count: "desc" };
    title?: "desc";
  } = {};
  switch (order) {
    case "date":
      ret.createdAt = "desc";
      break;
    case "likes":
      ret.likes = { _count: "desc" };
      break;
    case "alpha":
      ret.title = "desc";
      break;
  }
  return ret;
}

export const userProfileRouter = createRouter({
  profile: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    try {
      return await clerkClient.users.getUser(input);
    } catch (e) {
      // @ts-ignore
      if (e && Object.hasOwn(e, "status") && e.status === 404) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `the user ${input} doesn't exist`,
        });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  userPosts: publicProcedure
    .input(
      z
        .object({
          user: z.string().optional(),
          what: z.enum(["posts", "likes"]).default("posts"),
          sortBy: z.enum(["date", "likes", "alpha"]).default("date"),
          limit: PageSize,
          cursor: z.string().optional(),
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
      await findUser(id);

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

      return postPages(params, { include: { images: true } }, input.limit);
    }),
  userAlbums: publicProcedure
    .input(
      z
        .object({
          user: z.string().optional(),
          sortBy: z.enum(["date", "alpha"]).default("date"),
          limit: PageSize,
          cursor: z.string().optional(),
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
      await findUser(id);

      const params = {
        where: {
          userId: id,
          OR: [
            { visibility: Visibility.PUBLIC },
            ...(ctx.auth.userId !== null ? [{ userId: ctx.auth.userId }] : []),
            ...(id === ctx.auth.userId ? [{ visibility: Visibility.UNLISTED }] : []),
          ],
        },
        orderBy: prismaOrder(input.sortBy) as {
          createdAt?: "desc";
          title?: "desc";
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };

      return albumPages(params, { include: { posts: true } }, input.limit);
    }),
});
