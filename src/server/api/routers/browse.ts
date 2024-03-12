import { createRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Prisma, Visibility } from "@prisma/client";
import { parseSearch, postPages, prismaOrder } from "@/lib/db";
import { env } from "@/env";
import { Tag } from "@/lib/types";
import PostFindManyArgs = Prisma.PostFindManyArgs;
import QueryMode = Prisma.QueryMode;

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

      const tagQueries = tags.map((t) => {
        // god i hate typescript so much
        if (typeof t === "string" || t instanceof String) {
          return { tagName: t as string };
        } else {
          const tag = t as z.infer<typeof Tag>;
          return { tagCat: tag.category, tagName: tag.name };
        }
      });

      const params: PostFindManyArgs = {
        where: {
          visibility: Visibility.PUBLIC,
          // this is probably-no, definitely HORRIBLY inefficient
          AND: [
            ...tagQueries.map((t) => ({ tags: { some: t } })),
            ...other.map((o) => ({
              title: { contains: o, mode: QueryMode.insensitive },
            })),
          ],
          ...(sources.length > 0 ? { src: { in: sources } } : {}),
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: prismaOrder(input.sortBy),
      };

      return postPages(ctx, params, env.NEXT_PUBLIC_PAGE_SIZE);
    }),
});
