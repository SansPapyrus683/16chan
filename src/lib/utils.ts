import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArtSource } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    case "OTHER":
      return isValidHttpUrl(id) ? [id, id] : null;
  }
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}
