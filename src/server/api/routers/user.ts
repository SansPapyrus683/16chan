import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { PageSize, postPages } from "@/lib/pages";
import { Visibility } from "@prisma/client";

export const userRouter = createTRPCRouter({
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
    .query(async function ({ ctx, input }) {
      const id = input.user ?? ctx.auth.userId;
      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "you need to provide a user id or be logged in",
        });
      }

      // typescript sucks buttcheeks
      const order: {
        createdAt?: "desc";
        likes?: { _count: "desc" };
        title?: "desc";
      } = {};
      switch (input.sortBy) {
        case "date":
          order.createdAt = "desc";
          break;
        case "likes":
          order.likes = { _count: "desc" };
          break;
        case "alpha":
          order.title = "desc";
      }

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
            {
              visibility: Visibility.PUBLIC,
            },
            {
              userId: ctx.auth.userId,
            },
            ...(input.what === "likes" && id === ctx.auth.userId
              ? [{ visibility: Visibility.UNLISTED }]
              : []),
          ],
        },
        orderBy: order,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };

      console.log(params);

      return postPages(params, { include: { images: true } }, input.limit);
    }),
});
