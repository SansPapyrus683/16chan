import { Visibility } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export function prismaOrder(order: "new" | "likes" | "alpha") {
  const ret: {
    createdAt?: "desc";
    likes?: { _count: "desc" };
    title?: "desc";
  } = {};
  switch (order) {
    case "new":
      ret.createdAt = "desc";
      break;
    case "likes":
      ret.likes = { _count: "desc" };
      break;
    case "alpha":
      ret.title = "desc";
      break;
  }
  return ret;
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

export function parseSearch(query: string): [string[], string[]] {
  const splitQ = query.split(/(\s+)/).filter((s) => s);
  const tagged: string[] = [];
  const other: string[] = [];
  splitQ.forEach((s) =>
    (s.startsWith("tag:") ? tagged : other).push(s.replace(/^tag:/, "")),
  );
  return [tagged.map((t) => t.split(",")).flat(), other];
}
