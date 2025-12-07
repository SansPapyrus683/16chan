import { z } from "zod";
import { ArtSource, TagCategory } from "@prisma/client";
import { isValidHttpUrl, toTitleCase } from "@/lib/utils";

export function validTag(tag: string) {
  return /^[a-z][-a-z0-9]*$/.test(tag);
}

export const Tag = z.object({
  category: z.enum(TagCategory),
  name: z.string().toLowerCase().refine(validTag),
});

export const Sauce = z
  .object({
    src: z.enum(ArtSource),
    id: z.string(),
  })
  .optional();

export function parseSauce(
  mode: ArtSource | "AUTO",
  sauce: string,
): z.infer<typeof Sauce> {
  if (mode === "AUTO" || (mode !== "OC" && !sauce)) {
    return autoParse(sauce);
  }

  let test = () => true;
  switch (mode) {
    case "PIXIV":
    case "TWITTER":
      test = () => /^[0-9]+$/.test(sauce);
      break;
    case "DA":
      test = () => /^[-a-zA-Z0-9]+-[0-9]+$/.test(sauce); // MAKE BETTER LATER
      break;
    case "OTHER":
      test = () => isValidHttpUrl(sauce);
      break;
  }
  if (!test()) {
    throw new Error(`${sauce} is not a valid id for ${toTitleCase(mode)}`);
  }
  return Sauce.parse({ src: mode, id: sauce });
}

export function autoParse(url: string): z.infer<typeof Sauce> {
  if (!isValidHttpUrl(url)) {
    return Sauce.parse({ src: "OTHER", id: "" });
  }
  const regex = [
    { test: /https?:\/\/.*deviantart\.com.*\/art\/(.*[0-9]).*/, src: "DA" },
    { test: /https?:\/\/.*pixiv\.net.*\/artworks\/([0-9]+).*/, src: "PIXIV" },
    { test: /https?:\/\/.*twitter\.com.+\/status\/([0-9]+).*/, src: "TWITTER" },
  ];
  for (const { test, src } of regex) {
    const match = url.match(test);
    if (match) {
      return Sauce.parse({ src, id: match[1] });
    }
  }
  return Sauce.parse({ src: "OTHER", id: url });
}
