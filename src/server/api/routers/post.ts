import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { currentUser } from "@clerk/nextjs";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const user = await currentUser();

      return ctx.db.post.create({
        data: {
          userId: user?.id!,
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const user = await currentUser();
    return ctx.db.post.findFirst({
      where: { userId: user?.id },
      orderBy: { createdAt: "desc" },
    });
  }),
});
