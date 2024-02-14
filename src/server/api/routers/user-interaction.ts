import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { findUser } from "@/lib/data";

export const userInteractionRouter = createRouter({
  follow: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    if (ctx.auth.userId! === input) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "you can't follow yourself (unless you wanna be a dog)",
      });
    }
    await findUser(input);

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
});
