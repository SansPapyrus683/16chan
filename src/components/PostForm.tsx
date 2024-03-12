"use client";

import { type FormEvent, useMemo, useState } from "react";
import { parseSauce, Sauce, Tag } from "@/lib/types";
import { TagCategory, Visibility } from "@prisma/client";
import { sauceUrl, toTitleCase } from "@/lib/utils";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { TagsList } from "@/components/TagList";
import { TagForm } from "@/components/TagForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const SOURCE_NAME = {
  DA: "DeviantArt",
  PIXIV: "Pixiv",
  TWITTER: "Twitter",
  OTHER: "Other URL",
  OC: "Original (photo or art)",
  AUTO: "Auto-detect from URL",
};

type PostData = {
  pics: File[];
  title: string;
  tags: z.infer<typeof Tag>[];
  sauce: z.infer<typeof Sauce>;
  vis: Visibility;
};

export function PostForm({
  iPics = [],
  iTitle = "",
  iTags = [],
  iSauce = { src: "OTHER", id: "" },
  iVis = Visibility.PUBLIC,
  buttonText = "Submit",
  onSubmit,
  fields = {},
}: {
  iPics?: File[];
  iTitle?: string;
  iTags?: { tagCat: TagCategory; tagName: string }[];
  iSauce?: z.infer<typeof Sauce>;
  iVis?: Visibility;
  buttonText?: string;
  onSubmit: (pd: PostData) => any;
  fields?: {
    pics?: boolean;
    title?: boolean;
    tags?: boolean;
    sauce?: boolean;
    vis?: boolean;
    resetButton?: boolean;
  };
}) {
  fields = {
    pics: true,
    title: true,
    tags: true,
    sauce: true,
    vis: true,
    resetButton: true,
    ...fields,
  };

  const [pics, setPics] = useState<File[]>(iPics);
  const [title, setTitle] = useState(iTitle);
  const [tags, setTags] = useState<{ tagCat: TagCategory; tagName: string }[]>(iTags);
  const [sauce, setSauce] = useState(iSauce.id);
  const sourceType = sauceUrl(iSauce.src, iSauce.id) === null ? "AUTO" : iSauce.src;
  const [sauceType, setSauceType] = useState<keyof typeof SOURCE_NAME>(sourceType);
  const [vis, setVis] = useState<Visibility>(iVis);
  const [err, setErr] = useState("");

  const picUrls = useMemo(() => pics.map((p) => URL.createObjectURL(p)), [pics]);
  let parsedSauce: z.infer<typeof Sauce> | undefined;
  let displaySrc: [string, string] | null = null;
  try {
    parsedSauce = parseSauce(sauceType, sauce);
    displaySrc = sauceUrl(parsedSauce!.src, parsedSauce!.id);
  } catch (e) {}

  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // this is so cursed omg
    let goodTags: z.infer<typeof Tag>[] = [];
    try {
      goodTags = tags.map((t) => Tag.parse({ category: t.tagCat, name: t.tagName }));
    } catch (e) {
      setErr(`tag parsing: ${e}`);
      return;
    }

    onSubmit({
      pics,
      title,
      tags: goodTags,
      sauce: parsedSauce,
      vis,
    });
  };

  function clearForm() {
    setPics([]);
    setTitle("");
    setTags([]);
    setSauce("");
    setVis(Visibility.PUBLIC);
    setSauceType("AUTO");
  }

  return (
    <div className="space-y-2">
      <form onSubmit={formSubmit} className="space-y-4">
        <h2>Basic Info</h2>
        {fields.pics && (
          <>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                setPics(Array.from(e.target.files!));
              }}
            />
          </>
        )}

        {fields.title && (
          <>
            <Label htmlFor="title" className="sr-only">
              Post Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
            />
          </>
        )}

        <h2>Auxiliary Info</h2>

        {fields.tags && (
          <div>
            <h3>Tags</h3>
            <TagsList tags={tags} />
            <TagForm
              onSubmit={(t) => {
                const toAdd = { tagCat: t.category, tagName: t.name };
                if (!tags.includes(toAdd)) {
                  setTags([...tags, toAdd]);
                }
              }}
            />
          </div>
        )}

        {fields.sauce && (
          <div className="space-y-2">
            <h3>Source</h3>
            <Select onValueChange={(e: typeof sauceType) => setSauceType(e)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={SOURCE_NAME[sauceType]} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOURCE_NAME).map(([val, name]) => (
                  <SelectItem value={val} key={val}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sauceType !== "OC" && (
              <>
                <Label htmlFor="source" className="sr-only">
                  Source
                </Label>
                <Input
                  id="source"
                  value={sauce}
                  onChange={(e) => setSauce(e.target.value)}
                  placeholder="Source..."
                />
              </>
            )}
            Parsed source:{" "}
            {displaySrc ? (
              <Link href={displaySrc[1]} className="hover:underline">
                {displaySrc[0]}
              </Link>
            ) : (
              "no source detected (or error generating one)."
            )}
          </div>
        )}

        {fields.vis && (
          <Select onValueChange={(e: Visibility) => setVis(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={toTitleCase(vis)} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(Visibility).map((v) => (
                <SelectItem value={v} key={v}>
                  {toTitleCase(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button type="submit" className="block">
          {buttonText}
        </Button>

        {fields.resetButton && (
          <Button type="reset" className="block" onClick={clearForm}>
            Reset Form
          </Button>
        )}
      </form>

      <span className="text-red-600">{err}</span>

      {fields.pics && (
        <>
          <h3>Uploading {pics.length} images</h3>
          <div className="flex justify-between">
            {picUrls.map((p, i) => (
              <Image
                key={i}
                src={p}
                width="0"
                height="0"
                sizes="20vw"
                alt="alt"
                style={{ width: "20%", height: "10%" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
