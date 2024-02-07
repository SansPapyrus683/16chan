import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  userPosts: protectedProcedure
    .input(z.enum(["date", "likes", "alpha"]).default("date"))
    .query(async function ({ ctx, input }) {
      // typescript sucks buttcheeks
      const order: {
        createdAt?: "desc";
        likes?: { _count: "desc" };
        title?: "desc";
      } = {};
      switch (input) {
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
        where: { userId: ctx.auth.userId! },
        orderBy: order,
        include: { images: true },
      });
    }),
});
