import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { findUser, getFollowing } from "@/lib/db";
import { postPages } from "@/lib/pages";
import { env } from "@/env";
import { Prisma } from "@prisma/client";

export const userInteractionRouter = createRouter({
  follow: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    if (ctx.auth.userId! === input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you can't follow yourself (unless you wanna be a dog)",
      });
    }
    await findUser(ctx, input);

    const ids = {
      followerId: ctx.auth.userId!,
      idolId: input,
    };
    await ctx.db.userFollowing.upsert({
      where: { following: ids },
      create: ids,
      update: {},
    });
  }),
  unfollow: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.db.userFollowing.deleteMany({
      where: {
        idolId: input,
        followerId: ctx.auth.userId!,
      },
    });
  }),
  following: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    return getFollowing(ctx);
  }),
  followedPosts: protectedProcedure
    .input(
      z
        .object({
          cursor: z.string().uuid().optional(),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const followed = await getFollowing(ctx);
      // if you remove the type annotation typescript throws a tantrum
      const params: Prisma.PostFindManyArgs = {
        where: {
          userId: { in: followed.map((f) => f.idolId) },
        },
        orderBy: { createdAt: "desc" },
        cursor: input.cursor ? { id: input.cursor } : undefined,
      };
      return postPages(
        ctx,
        params,
        { include: { images: true } },
        env.NEXT_PUBLIC_PAGE_SIZE,
      );
    }),
});
