import { ArtSource, Prisma, Visibility } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export function prismaOrder(order: "new" | "likes" | "alpha") {
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
  const tags: string[] = [];
  const other: string[] = [];
  const sources: ArtSource[] = [];

  splitQ.forEach((s) => {
    if (s.startsWith("tag:")) {
      tags.push(s.replace(/^tag:/, ""));
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
