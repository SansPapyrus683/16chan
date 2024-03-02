import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Visibility } from "@prisma/client";
import { parseSearch, postPages, prismaOrder } from "@/lib/db";
import { env } from "@/env";

export const browseRouter = createRouter({
  browse: publicProcedure
    .input(
      z.object({
        query: z.string().default(""),
        sortBy: z.enum(["new", "likes"]).default("new"),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tags, other, sources } = parseSearch(input.query);
      const params = {
        where: {
          visibility: Visibility.PUBLIC,
          // this is probably-no, definitely HORRIBLY inefficient
          AND: [
            ...tags.map((t) => ({
              tags: { some: { tagName: t } },
            })),
            ...other.map((o) => ({
              title: { contains: o },
            })),
          ],
          ...(sources.length > 0
            ? {
                src: { in: sources },
              }
            : {}),
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: prismaOrder(input.sortBy),
      };

      return postPages(ctx, params, env.NEXT_PUBLIC_PAGE_SIZE);
    }),
});
