import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs";

export const userRouter = createTRPCRouter({
  profile: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => await clerkClient.users.getUser(input)),
  userPosts: publicProcedure
    .input(
      z
        .object({
          user: z.string().optional(),
          sortBy: z.enum(["date", "likes", "alpha"]).default("date"),
        })
        .default({}),
    )
    .query(async function ({ ctx, input }) {
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

      return ctx.db.post.findMany({
        where: { userId: input.user ?? ctx.auth.userId! },
        orderBy: order,
        include: { images: true },
      });
    }),
});
