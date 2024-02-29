import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArtSource } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function serverFetch<T>(
  func: () => Promise<T>,
): Promise<{ good: true; val: T } | { good: false; err: string }> {
  try {
    return { good: true, val: await func() };
  } catch (e) {
    let err = "something screwed up";
    if (e instanceof TRPCError) {
      if (e.code === "NOT_FOUND") {
        notFound();
      } else if (e.code === "FORBIDDEN") {
        err = "not authorized to see this";
      }
    }
    return { good: false, err };
  }
}

export function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export function sauceUrl(source: ArtSource, id: string): [string, string] | null {
  switch (source) {
    case "DA":
      return [`DeviantArt ID ${id}`, `https://deviantart.com/art/${id}`];
    case "TWITTER":
      return [`Twitter ID ${id}`, `https://twitter.com/i/web/status/${id}`];
    case "PIXIV":
      return [`Pixiv ID ${id}`, `https://pixiv.net/artworks/${id}`];
    case "OC":
      return ["Original art", "#"];
    case "OTHER":
      return isValidHttpUrl(id) ? [id, id] : null;
  }
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}
