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

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        images: z
          .string()
          .refine((d) => Base64.isValid(removeDataURL(d)))
          .array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.create({
        data: {
          userId: ctx.auth.userId!,
          title: input.title,
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
  get: publicProcedure.input(z.string().uuid()).query(async function ({
    ctx,
    input,
  }) {
    const post = await ctx.db.post.findUnique({
      where: { id: input },
      include: { images: true },
    });
    if (post === null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `post w/ id ${input} not found`,
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
      return ctx.db.post.delete({ where: { id: input } });
    }),
  like: protectedProcedure.input(z.string().uuid()).mutation(async function ({
    ctx,
    input,
  }) {
    await ctx.db.post.update({
      where: { id: input },
      data: { likes: { create: [{ userId: ctx.auth.userId! }] } },
    });
  }),
});
