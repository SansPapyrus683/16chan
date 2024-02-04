import { z } from "zod";
import { Base64 } from "js-base64";
import { v4 as uuid } from "uuid";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { ACCEPTED_IMAGE_TYPES, imageType, removeDataURL } from "@/lib/files";
import { TRPCError } from "@trpc/server";
import { s3Upload } from "@/lib/s3";

export const picRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        post: z.number().min(1),
        img: z.string().refine((d) => Base64.isValid(removeDataURL(d))),
        imgType: imageType,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findFirst({ where: { id: input.post } });
      if (post == null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "post doesn't exit",
        });
      }

      const img = input.img;
      const type = img.substring("data:".length, img.indexOf(";base64"));
      if (!ACCEPTED_IMAGE_TYPES.includes(type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "image format not supported",
        });
      }

      const ext = type.slice("image/".length);
      const path = `${ctx.auth.userId}/${post.id}-${uuid()}.${ext}`;
      await s3Upload(path, img, type);
      return ctx.db.pic.create({
        data: {
          post: { connect: { id: input.post } },
          pic: path,
        },
      });
    }),
});
