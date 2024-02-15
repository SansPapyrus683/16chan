import { type Context, createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { findUser } from "@/lib/data";
import { db } from "@/server/db";
import { postPages } from "@/lib/pages";
import { env } from "@/env";

async function getFollowing(ctx: Context) {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "not logged in",
    });
  }
  return db.userFollowing.findMany({
    where: {
      followerId: ctx.auth.userId!,
    },
  });
}

export const userInteractionRouter = createRouter({
  follow: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    if (ctx.auth.userId! === input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you can't follow yourself (unless you wanna be a dog)",
      });
    }
    await findUser(ctx, input);

    // SOMEONE PLEASE TELL ME THERE'S A MORE EFFICIENT WAY TO DO THIS ~KS
    await ctx.db.userFollowing.upsert({
      where: {
        idolId_followerId: {
          followerId: ctx.auth.userId!,
          idolId: input,
        },
      },
      create: {
        followerId: ctx.auth.userId!,
        idolId: input,
      },
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
  followedPosts: protectedProcedure.input(z.void()).query(async ({ ctx }) => {
    const followed = await getFollowing(ctx);
    return postPages(
      {
        where: {
          userId: { in: followed.map((f) => f.idolId) },
        },
        orderBy: { createdAt: "desc" },
      },
      { include: { images: true } },
      env.NEXT_PUBLIC_PAGE_SIZE,
    );
  }),
});
