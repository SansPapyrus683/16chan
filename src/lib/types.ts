import { z } from "zod";
import { ArtSource, TagCategory, Visibility } from "@prisma/client";
import { isValidHttpUrl } from "@/lib/utils";

// maybe this is a bit too short for a centralized definition, but oh well
export const Vis = z.custom<Visibility>().optional();

const TAG_CATS = ["CHARACTER", "LOCATION", "MEDIA", "OTHER"];

// zod sucks with custom types so i had to make this custom function
export function parseTag(
  name: string,
  category: string | undefined,
): z.infer<typeof Tag> {
  const upper = (category ?? "").toUpperCase();
  return Tag.parse({ name, category: !TAG_CATS.includes(upper) ? "OTHER" : upper });
}

export const Tag = z.object({
  name: z.string().toLowerCase().refine(validTag),
  // zod, please play nice with prisma
  category: z.custom<TagCategory>(),
});

export function validTag(tag: string) {
  return /^[-a-z]+$/.test(tag);
}

export const Sauce = z.object({
  src: z.custom<ArtSource>(),
  id: z.string(),
});

export function parseSauce(url: string): z.infer<typeof Sauce> {
  if (!isValidHttpUrl(url)) {
    return Sauce.parse({ src: "OTHER", id: "" });
  }
  const regex = [
    { test: /https?:\/\/.*deviantart\.com.*\/art\/(.*[0-9])/, src: "DA" },
    { test: /https?:\/\/.*pixiv\.net.*\/artworks\/([0-9]+)/, src: "PIXIV" },
    { test: /https?:\/\/.*twitter\.com.+\/status\/([0-9]+)/, src: "TWITTER" },
  ];
  for (const { test, src } of regex) {
    const match = url.match(test);
    if (match) {
      return Sauce.parse({ src, id: match[1] });
    }
  }
  return Sauce.parse({ src: "OTHER", id: url });
}
