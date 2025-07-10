import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findComment, findPost, isMod } from "@/lib/db";

export const commentRouter = createRouter({
  create: protectedProcedure
    .input(z.object({ post: z.uuid(), text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await findPost(ctx, input.post);
      return ctx.db.comment.create({
        data: {
          userId: ctx.auth.userId!,
          postId: input.post,
          text: input.text,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.uuid())
    .mutation(async ({ ctx, input }) => {
      const comm = await findComment(ctx, input, false);
      if (comm === null) {
        return null;
      }
      if (!(await isMod(ctx))) {
        checkPerms(comm, ctx.auth.userId!, "change");
      }
      await ctx.db.comment.delete({ where: { id: input } });
    }),
});
