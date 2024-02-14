import { createRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { checkPerms, findAlbum } from "@/lib/data";

export const albumRouter = createRouter({
  create: protectedProcedure
    .input(z.string().optional())
    .mutation(async ({ ctx, input }) => {
      const user = ctx.db.user.findUnique({
        where: { id: ctx.auth.userId! },
        select: {
          albums: true,
        },
      });
      if (input === undefined) {
        input = `new album ${user.albums.length + 1}`;
      }

      return ctx.db.album.create({
        data: {
          userId: ctx.auth.userId!,
          name: input,
        },
      });
    }),
  get: publicProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const album = await findAlbum(input);
    checkPerms(album, ctx.auth.userId, "view");
    return album;
  }),
});
