import { z } from "zod";
import { Base64 } from "js-base64";
import { TRPCError } from "@trpc/server";
import { v4 as uuid } from "uuid";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ACCEPTED_IMAGE_TYPES, removeDataURL } from "@/lib/files";
import { s3Upload } from "@/lib/s3";

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
      for (const img of input.images) {
        const type = img.substring("data:".length, img.indexOf(";base64"));
        if (!ACCEPTED_IMAGE_TYPES.includes(type)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "image format not supported",
          });
        }

        const ext = type.slice("image/".length);
        const path = `${ctx.auth.userId}/${post.id}-${uuid()}.${ext}`;
        imgPaths.push(path);
        void s3Upload(path, img, type);
      }

      await ctx.db.pic.createMany({
        data: imgPaths.map((p) => ({
          postId: post.id,
          pic: p,
        })),
      });

      return post;
    }),
});
