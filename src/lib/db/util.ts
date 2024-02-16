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

export function parseSearch(query: string): [string[], string[]] {
  const splitQ = query.split(/(\s+)/).filter((s) => s);
  const tagged: string[] = [];
  const other: string[] = [];
  splitQ.forEach((s) =>
    (s.startsWith("tag:") ? tagged : other).push(s.replace(/^tag:/, "")),
  );
  return [tagged.map((t) => t.split(",")).flat(), other];
}
