import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userInteractionRouter = createRouter({
  follow: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.db.user.update({
      where: { id: ctx.auth.userId! },
      data: { idols: { create: [{ idolId: input }] } },
    });
  }),
});
