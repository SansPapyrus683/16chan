import { z } from "zod";
import { ArtSource, TagCategory, Visibility } from "@prisma/client";
import { isValidHttpUrl } from "@/lib/utils";

// maybe this is a bit too short for a centralized definition, but oh well
export const Vis = z.nativeEnum(Visibility).optional();

export function validTag(tag: string) {
  return /^[-a-z]+$/.test(tag);
}

export const Tag = z.object({
  category: z.nativeEnum(TagCategory).catch("OTHER"),
  name: z.string().toLowerCase().refine(validTag),
});

export const Sauce = z
  .object({
    src: z.nativeEnum(ArtSource),
    id: z.string(),
  })
  .optional();

export function parseSauce(mode: ArtSource | "AUTO", sauce: string) {
  if (mode === "AUTO") {
    return autoParse(sauce);
  }

  let test;
  switch (mode) {
    case "PIXIV":
    case "TWITTER":
      test = () => /^[0-9]+$/.test(sauce);
      break;
    case "DA":
      test = () => /^.*$/.test(sauce); // MAKE BETTER LATER
      break;
    case "OTHER":
      test = () => isValidHttpUrl(sauce);
      break;
  }
  if (!test()) {
    throw new Error(`${sauce} is not a valid id for ${mode}`);
  }
  return Sauce.parse({ src: mode, id: sauce });
}

export function autoParse(url: string): z.infer<typeof Sauce> {
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
