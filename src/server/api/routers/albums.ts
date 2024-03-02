import { createRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum } from "@/lib/db";
import { Visibility } from "@prisma/client";

export const albumRouter = createRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          name: z.string().optional(),
          visibility: z.nativeEnum(Visibility).optional(),
        })
        .default({}),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId! },
        select: {
          albums: true,
        },
      });
      if (!input.name) {
        input.name = `new album ${user!.albums.length + 1}`;
      }

      return ctx.db.album.create({
        data: {
          userId: ctx.auth.userId!,
          name: input.name,
          visibility: input.visibility,
        },
      });
    }),
  get: publicProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const album = await findAlbum(ctx, input, true, { images: true });
    checkPerms(album!, ctx.auth.userId, "view");
    return album;
  }),
  edit: protectedProcedure
    .input(
      z.object({
        aid: z.string().uuid(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await findAlbum(ctx, input.aid);
      return ctx.db.album.update({
        where: { id: input.aid },
        data: {
          name: input.name,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const album = await findAlbum(ctx, input, false);
      if (album === null) {
        return null;
      }
      checkPerms(album!, ctx.auth.userId, "change");
      return ctx.db.album.delete({ where: { id: input } });
    }),
});
