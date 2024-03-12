import { ArtSource, Prisma, Visibility } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Tag } from "@/lib/types";

export function prismaOrder(
  order: "new" | "likes" | "alpha",
): Prisma.PostOrderByWithRelationInput[] {
  const desc = Prisma.SortOrder.desc; // just a shorthand
  return [
    ...(order === "likes" ? [{ likes: { _count: desc } }] : []),
    ...(order === "alpha" ? [{ title: desc }] : []),
    { createdAt: desc },
  ];
}

export function checkPerms(
  item: { visibility?: Visibility; userId: string | null },
  userId: string | null,
  type: "view" | "change" | "delete",
) {
  let hasPerms;
  switch (type) {
    case "view":
      hasPerms = item.visibility !== Visibility.PRIVATE || userId === item.userId;
      break;
    case "change":
    case "delete":
      hasPerms = userId === item.userId;
      break;
  }
  if (!hasPerms) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "you don't have the permissions to execute this action.",
    });
  }
}

export function searchSourceConv(src: string) {
  switch (src.toUpperCase()) {
    case "PIXIV":
    case "PIX":
      return ArtSource.PIXIV;
    case "DEVIANTART":
    case "DA":
      return ArtSource.DA;
    case "TWITTER":
    case "X":
      return ArtSource.TWITTER;
    case "OC":
    case "OG":
      return ArtSource.OC;
    case "OTHER":
      return ArtSource.OTHER;
  }
}

export function parseSearch(query: string) {
  const splitQ = query.split(/(\s+)/).filter((s) => s);
  const tags: (z.infer<typeof Tag> | string)[] = [];
  const other: string[] = [];
  const sources: ArtSource[] = [];

  splitQ.forEach((s) => {
    if (s.startsWith("tag:")) {
      s = s.replace(/^tag:/, "");
      const split = s
        .toLowerCase()
        .split(/:(.*)/s)
        .filter((i) => i);
      if (split.length === 1) {
        tags.push(split[0]!);
      } else if (split.length === 2) {
        try {
          tags.push(Tag.parse({ category: split[0]!.toUpperCase(), name: split[1]! }));
        } catch (e) {
          tags.push(split[1]!);
        }
      }
    } else if (s.startsWith("src:") || s.startsWith("source:")) {
      s = s.replace(/^(src|source):/, "");
      let src = searchSourceConv(s);
      if (src) {
        sources.push(src);
      }
    } else {
      other.push(s);
    }
  });
  return {
    tags,
    sources,
    other,
  };
}
