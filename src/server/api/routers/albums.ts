import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const albumRouter = createTRPCRouter({
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
});
