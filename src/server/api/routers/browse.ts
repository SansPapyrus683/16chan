import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Visibility } from "@prisma/client";
import { parseSearch, prismaOrder } from "@/lib/db";
import { postPages } from "@/lib/pages";
import { env } from "@/env";

export const browseRouter = createRouter({
  browse: publicProcedure
    .input(
      z.object({
        query: z.string().optional(),
        sortBy: z.enum(["new", "likes"]).default("new"),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [tags, other] = input.query ? parseSearch(input.query) : [[], []];
      const params = {
        where: {
          visibility: Visibility.PUBLIC,
          // this is probably-no, definitely HORRIBLY inefficient
          AND: [
            ...tags.map((t) => ({
              tags: { some: { name: t } },
            })),
            ...other.map((o) => ({
              title: { contains: o },
            })),
          ],
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: prismaOrder(input.sortBy),
      };
      return postPages(ctx, params, {}, env.NEXT_PUBLIC_PAGE_SIZE);
    }),
});
