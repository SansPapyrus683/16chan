import { z } from "zod";
import { TagCategory, Visibility } from "@prisma/client";

// maybe this is a bit too short for a centralized definition, but oh well
export const Vis = z.custom<Visibility>().optional();

const TAG_CATS = ["CHARACTER", "LOCATION", "MEDIA", "OTHER"];

// zod sucks with custom types so i had to make this custom function
export function parseTag(name: string, category: string | undefined) {
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
