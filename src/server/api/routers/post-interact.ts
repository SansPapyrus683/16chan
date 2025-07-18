import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum, findPost, isMod } from "@/lib/db";
import { Tag } from "@/lib/types";

export const postInteractRouter = createRouter({
  like: protectedProcedure.input(z.uuid()).mutation(async ({ ctx, input }) => {
    const post = await findPost(ctx, input);
    // liking doesn't really change the post- as long as the user can view it it's fine
    checkPerms(post!, ctx.auth.userId, "view");

    const ids = {
      postId: post!.id,
      userId: ctx.auth.userId!,
    };
    await ctx.db.userLikes.upsert({
      where: { liking: ids },
      create: ids,
      update: {},
    });
  }),
  isLiked: protectedProcedure.input(z.uuid()).query(async ({ ctx, input }) => {
    return (
      (await ctx.db.userLikes.findUnique({
        where: { liking: { postId: input, userId: ctx.auth.userId! } },
      })) !== null
    );
  }),
  unlike: protectedProcedure
    .input(z.uuid())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.userLikes.deleteMany({
        where: { postId: input, userId: ctx.auth.userId! },
      });
    }),
  addToAlbum: protectedProcedure
    .input(
      z.object({
        post: z.uuid(),
        album: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input.post);
      checkPerms(post!, ctx.auth.userId, "view");
      const album = await findAlbum(ctx, input.album);
      checkPerms(album!, ctx.auth.userId, "change");

      const ids = {
        postId: input.post,
        albumId: input.album,
      };
      await ctx.db.albumPosts.upsert({
        where: { postAlbum: ids },
        create: ids,
        update: {},
      });
    }),
  deleteFromAlbum: protectedProcedure
    .input(z.object({ post: z.uuid(), album: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const album = await findAlbum(ctx, input.album, false);
      if (album === null) {
        return null;
      }
      checkPerms(album, ctx.auth.userId, "change");
      await ctx.db.albumPosts.delete({
        where: {
          postAlbum: {
            postId: input.post,
            albumId: input.album,
          },
        },
      });
    }),
  tag: protectedProcedure
    .input(z.object({ post: z.uuid(), tags: Tag.array() }))
    .mutation(async ({ ctx, input }) => {
      await findPost(ctx, input.post);

      await ctx.db.tag.createMany({
        data: input.tags,
        skipDuplicates: true,
      });

      const ids = input.tags.map((t) => ({
        postId: input.post,
        tagName: t.name,
        tagCat: t.category,
      }));
      return ctx.db.postTags.createMany({
        data: ids,
        skipDuplicates: true,
      });
    }),
  untag: protectedProcedure
    .input(z.object({ post: z.uuid(), tag: Tag }))
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input.post);
      if (!(await isMod(ctx))) {
        checkPerms(post!, ctx.auth.userId, "change");
      }
      await ctx.db.postTags.deleteMany({
        where: {
          postId: input.post,
          tagName: input.tag.name,
          tagCat: input.tag.category,
        },
      });
    }),
});
