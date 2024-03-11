import { z } from "zod";
import { Base64 } from "js-base64";
import { TRPCError } from "@trpc/server";

import { createRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  ACCEPTED_IMAGE_TYPES,
  base64Mb,
  base64StripUrl,
  base64Type,
} from "@/lib/files";
import { checkPerms, findPost, isMod } from "@/lib/db";
import { s3Delete, s3Upload } from "@/lib/s3";
import { Sauce, Tag } from "@/lib/types";
import { Visibility } from "@prisma/client";

export const postCrudRouter = createRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        images: z
          .string()
          .refine((d) => Base64.isValid(base64StripUrl(d)))
          .refine((d) => base64Mb(d) < 20)
          .refine((d) => ACCEPTED_IMAGE_TYPES.includes(base64Type(d)))
          .array()
          .min(1)
          .max(4),
        visibility: z.nativeEnum(Visibility).optional(),
        sauce: Sauce,
        tags: Tag.array().default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tag.createMany({
        data: input.tags.map((t) => ({
          name: t.name,
          category: t.category,
        })),
        skipDuplicates: true,
      });
      const post = await ctx.db.post.create({
        data: {
          userId: ctx.auth.userId!,
          title: input.title,
          visibility: input.visibility,
          tags: {
            create: input.tags.map((t) => ({
              tagName: t.name,
              tagCat: t.category,
            })),
          },
          src: input.sauce?.src,
          artId: input.sauce?.id,
        },
      });

      const imgPaths = [];
      for (const [v, img] of input.images.entries()) {
        const type = base64Type(img);
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
    const post = await findPost(ctx, input, true, {
      images: true,
      comments: true,
      tags: true,
      likes: { where: { userId: ctx.auth.userId ?? "" } },
    });
    checkPerms(post!, ctx.auth.userId, "view");
    return post!;
  }),
  edit: protectedProcedure
    .input(
      z.object({
        pid: z.string().uuid(),
        title: z.string().optional(),
        sauce: Sauce.optional(),
        tags: Tag.array().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await findPost(ctx, input.pid);
      if (input.tags) {
        await ctx.db.tag.createMany({
          data: input.tags.map((t) => ({
            name: t.name,
            category: t.category,
          })),
          skipDuplicates: true,
        });
        await ctx.db.postTags.deleteMany({
          where: { postId: input.pid },
        });
      }

      return ctx.db.post.update({
        where: {
          id: input.pid,
        },
        data: {
          title: input.title,
          src: input.sauce?.src,
          artId: input.sauce?.id,
          tags: input.tags && {
            create: input.tags.map((t) => ({
              tagName: t.name,
              tagCat: t.category,
            })),
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const post = await findPost(ctx, input, false);
      if (post === null) {
        return null;
      }
      if (!(await isMod(ctx))) {
        checkPerms(post, ctx.auth.userId, "delete");
      }
      await ctx.db.post.delete({ where: { id: input } });
    }),
});
