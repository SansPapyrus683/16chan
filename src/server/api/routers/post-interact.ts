import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum, findPost } from "@/lib/db";

export const postInteractRouter = createRouter({
  like: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const post = await findPost(ctx, input, false);
    // liking doesn't really change the post- as long as the user can view it it's fine
    checkPerms(post!, ctx.auth.userId, "view");
    await ctx.db.userLikes.upsert({
      where: {
        postId_userId: {
          userId: ctx.auth.userId!,
          postId: post!.id,
        },
      },
      create: {
        userId: ctx.auth.userId!,
        postId: post!.id,
      },
      update: {},
    });
  }),
  unlike: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input, false);
      if (post !== null) {
        // liking doesn't really change the post- as long as the user can view it it's fine
        checkPerms(post, ctx.auth.userId, "view");
        // apparently delete throws an error if it doesn't exist??
        await ctx.db.userLikes.deleteMany({
          where: { postId: input, userId: ctx.auth.userId! },
        });
      }
    }),
  addToAlbum: protectedProcedure
    .input(
      z.object({
        post: z.string().uuid(),
        album: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input.post, false);
      checkPerms(post!, ctx.auth.userId, "view");
      const album = await findAlbum(ctx, input.album, false);
      checkPerms(album!, ctx.auth.userId, "change");
      await ctx.db.albumPosts.create({
        data: { postId: input.post, albumId: input.album },
      });
    }),
});
