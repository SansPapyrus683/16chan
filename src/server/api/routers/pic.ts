import { z } from "zod";
import { Base64 } from "js-base64";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { imageType, removeDataURL } from "@/lib/files";
import { TRPCError } from "@trpc/server";

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

      return ctx.db.pic.create({
        data: {
          post: { connect: { id: input.post } },
          pic: "asdf",
        },
      });
    }),
});
