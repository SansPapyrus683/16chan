import { createRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum, findPost, isMod, Tag } from "@/lib/db";

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
      await ctx.db.userLikes.deleteMany({
        where: { postId: input, userId: ctx.auth.userId! },
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
      const post = await findPost(ctx, input.post, false);
      checkPerms(post!, ctx.auth.userId, "view");
      const album = await findAlbum(ctx, input.album, false);
      checkPerms(album!, ctx.auth.userId, "change");
      // i want to just barf my eyes out looking at this jesus christ
      await ctx.db.albumPosts.upsert({
        where: {
          postId_albumId: {
            postId: input.post,
            albumId: input.album,
          },
        },
        create: {
          postId: input.post,
          albumId: input.album,
        },
        update: {},
      });
    }),
  deleteFromAlbum: protectedProcedure
    .input(z.object({ post: z.string().uuid(), album: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const album = await findAlbum(ctx, input.album, false, false);
      if (album === null) {
        return null;
      }
      checkPerms(album, ctx.auth.userId, "change");
      await ctx.db.albumPosts.deleteMany({
        where: {
          postId: input.post,
          albumId: input.album,
        },
      });
    }),
  tag: protectedProcedure
    .input(z.object({ post: z.string().uuid(), tag: Tag }))
    .mutation(async ({ ctx, input }) => {
      await findPost(ctx, input.post, false);
      return ctx.db.post.update({
        where: { id: input.post },
        data: {
          tags: {
            connectOrCreate: {
              where: {
                name: input.tag.name,
              },
              create: {
                name: input.tag.name,
                category: input.tag.category,
              },
            },
          },
        },
      });
    }),
  untag: protectedProcedure
    .input(z.object({ post: z.string().uuid(), tag: Tag }))
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input.post, false);
      if (!(await isMod(ctx))) {
        checkPerms(post!, ctx.auth.userId, "change");
      }
      return ctx.db.post.update({
        where: { id: input.post },
        data: {
          tags: {
            disconnect: {
              name: input.tag.name,
            },
          },
        },
      });
    }),
});
