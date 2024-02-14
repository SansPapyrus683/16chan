import { z } from "zod";
import { Base64 } from "js-base64";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ACCEPTED_IMAGE_TYPES, removeDataURL } from "@/lib/files";
import { s3Delete, s3Retrieve, s3Upload } from "@/lib/s3";
import { Visibility } from "@prisma/client";
import { checkPerms, findAlbum, findPost } from "@/lib/data";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        images: z
          .string()
          .refine((d) => Base64.isValid(removeDataURL(d)))
          .array(),
        visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          userId: ctx.auth.userId!,
          title: input.title,
          visibility: input.visibility,
        },
      });

      const imgPaths = [];
      for (const [v, img] of input.images.entries()) {
        const type = img.substring("data:".length, img.indexOf(";base64"));
        if (!ACCEPTED_IMAGE_TYPES.includes(type)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "image format not supported",
          });
        }

        const ext = type.slice("image/".length);
        const path = `${post.id}-p${v}.${ext}`;
        imgPaths.push(path);
        try {
          await s3Upload(path, img, type);
        } catch (e) {
          for (const prev of imgPaths) {
            void s3Delete(prev);
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: String(e),
          });
        }
      }

      await ctx.db.image.createMany({
        data: imgPaths.map((p) => ({
          postId: post.id,
          img: p,
        })),
      });

      return post;
    }),
  get: publicProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const post = await findPost(input);
    checkPerms(post, ctx.auth.userId, "view");
    if (
      post.visibility === Visibility.PRIVATE &&
      (!ctx.auth.userId || ctx.auth.userId !== post.userId)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "this post is private.",
      });
    }

    return {
      ...post,
      images: await Promise.all(
        post.images.map(async (i) => ({ ...i, img: await s3Retrieve(i.img) })),
      ),
    };
  }),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(input, false);
      checkPerms(post, ctx.auth.userId, "change");
      return ctx.db.post.delete({ where: { id: input } });
    }),
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
