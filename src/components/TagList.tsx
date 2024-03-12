import { TagCategory } from "@prisma/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TagsList({
  tags,
}: {
  tags: { tagName: string; tagCat: TagCategory }[];
}) {
  const tagsMap: { [key: string]: string[] } = {};
  for (const cat of Object.keys(TagCategory)) {
    tagsMap[cat] = [];
  }
  tags.forEach(({ tagCat, tagName }) => tagsMap[tagCat]!.push(tagName));

  return (
    <div className="m-2">
      {Object.entries(tagsMap).map(
        ([cat, tags]) =>
          tags.length > 0 && (
            <Collapsible defaultOpen key={cat}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto px-2 py-0 text-base text-gray-500"
                >
                  {cat}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mb-2 ml-4">
                  {tagsMap[cat]!.map((t: string) => (
                    <li key={t}>
                      <Link
                        href={`/?${new URLSearchParams([["q", `tag:${t}`]])}`}
                        className="hover:underline"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ),
      )}
    </div>
  );
}
