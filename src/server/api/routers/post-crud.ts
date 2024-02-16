import { z } from "zod";
import { Base64 } from "js-base64";
import { TRPCError } from "@trpc/server";

import { createRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { ACCEPTED_IMAGE_TYPES, removeDataURL } from "@/lib/files";
import { s3Delete, s3Upload } from "@/lib/s3";
import { checkPerms, findPost, isMod } from "@/lib/db";

export const postCrudRouter = createRouter({
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
    const post = await findPost(ctx, input);
    checkPerms(post!, ctx.auth.userId, "view");
    return post;
  }),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input, false, false);
      if (post === null) {
        return null;
      }
      if (!(await isMod(ctx))) {
        checkPerms(post, ctx.auth.userId, "change");
      }
      await ctx.db.post.delete({ where: { id: input } });
    }),
});
