import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum, findPost } from "@/lib/data";

export const postInteractRouter = createRouter({
  like: protectedProcedure.input(z.string().uuid()).mutation(async ({ ctx, input }) => {
    const post = await findPost(input, false);
    // liking doesn't really change the post- as long as the user can view it it's fine
    checkPerms(post, ctx.auth.userId, "view");
    await ctx.db.post.update({
      where: { id: input },
      data: { likes: { create: [{ userId: ctx.auth.userId! }] } },
    });
  }),
  addToAlbum: protectedProcedure
    .input(
      z.object({
        post: z.string().uuid(),
        album: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(input.post, false);
      checkPerms(post, ctx.auth.userId, "view");
      const album = await findAlbum(input.album, false);
      checkPerms(album, ctx.auth.userId, "change");

      await ctx.db.album.update({
        where: { id: input.album },
        data: { posts: { connect: { id: input.post } } },
      });
    }),
});
