"use client";

import { type FormEvent, Fragment, useState } from "react";
import { parseSauce, Sauce, Tag } from "@/lib/types";
import { TagCategory, Visibility } from "@prisma/client";
import { sauceUrl, toTitleCase } from "@/lib/utils";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/ui/button";

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

export function TagForm({
  tagType,
  tagContent,
  tagNumber,
  onTypeChange,
  onContentChange,
  onDelete,
}: {
  tagType: string;
  tagContent: string;
  tagNumber: number;
  onTypeChange: (tagIndex: number, newType: string) => void;
  onContentChange: (tagIndex: number, newContent: string) => void;
  onDelete: (tagIndex: number) => void;
}) {
  return (
    <div>
      Tag #{tagNumber}
      <button className="block border-2 p-0.5" onClick={() => onDelete(tagNumber)}>
        Delete Tag
      </button>
      {Object.keys(TagCategory).map((t) => (
        <Fragment key={t}>
          <input
            type="radio"
            id={t}
            name={`tag${tagNumber}`}
            checked={tagType === t}
            onChange={() => onTypeChange(tagNumber, t)}
          />
          <label htmlFor={t}>{toTitleCase(t)}</label>
        </Fragment>
      ))}
      <input
        value={tagContent}
        onChange={(e) => onContentChange(tagNumber, e.target.value)}
        placeholder="tag content... "
        className="block border-2"
      />
    </div>
  );
}

export function PostForm({
  iPics = [],
  iTitle = "",
  iTagTypes = [],
  iTagContents = [],
  iSauce = { src: "OTHER", id: "" },
  iVis = Visibility.PUBLIC,
  editVis = false,
  buttonText = "submit",
  onSubmit, // why the hell is next js giving warnings on these two
}: {
  iPics?: File[];
  iTitle?: string;
  iTagTypes?: string[];
  iTagContents?: string[];
  iSauce?: z.infer<typeof Sauce>;
  iVis?: Visibility;
  editVis?: boolean;
  buttonText?: string;
  onSubmit: (pd: PostData) => void;
}) {
  const [pics, setPics] = useState<File[]>(iPics);
  const [title, setTitle] = useState(iTitle);
  const [tagTypes, setTagTypes] = useState<string[]>(iTagTypes);
  const [tagContents, setTagContents] = useState<string[]>(iTagContents);
  const [sauce, setSauce] = useState(iSauce.id);
  const sourceType = sauceUrl(iSauce.src, iSauce.id) === null ? "AUTO" : iSauce.src;
  const [sauceType, setSauceType] = useState<keyof typeof SOURCE_NAME>(sourceType);
  const [vis, setVis] = useState<Visibility>(iVis);
  const [err, setErr] = useState("");

  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // this is so cursed omg
    let goodTags: z.infer<typeof Tag>[] = [];
    try {
      for (let i = 0; i < tagTypes.length; i++) {
        goodTags.push(Tag.parse({ category: tagTypes[i], name: tagContents[i] }));
      }
    } catch (e) {
      setErr(`tag parsing: ${e}`);
      return;
    }

    let parsedSauce;
    try {
      parsedSauce = parseSauce(sauceType, sauce);
    } catch (e) {
      setErr(`source parsing: ${e}`);
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
    setTagTypes([]);
    setTagContents([]);
    setSauce("");
    setVis(Visibility.PUBLIC);
    setSauceType("AUTO");
  }

  function onTagTypeChange(tagIndex: number, newType: string) {
    setTagTypes(tagTypes.map((t, i) => (i !== tagIndex ? t : newType)));
  }

  function onTagContentChange(tagIndex: number, newContent: string) {
    setTagContents(tagContents.map((t, i) => (i !== tagIndex ? t : newContent)));
  }

  function onTagDelete(tagIndex: number) {
    setTagContents(tagContents.filter((_, i) => i !== tagIndex));
    setTagTypes(tagTypes.filter((_, i) => i !== tagIndex));
  }

  function onTagAdd() {
    setTagContents([...tagContents, ""]);
    setTagTypes([...tagTypes, "CHARACTER"]);
  }

  return (
    <div className="space-y-2">
      <form onSubmit={formSubmit} className="space-y-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            setPics([...pics, ...Array.from(e.target.files!)]);
          }}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title..."
          className="block border-2"
        />

        {tagTypes.map((t, i) => (
          <TagForm
            key={i}
            tagType={t}
            tagContent={tagContents[i]!}
            tagNumber={i}
            onTypeChange={onTagTypeChange}
            onContentChange={onTagContentChange}
            onDelete={onTagDelete}
          />
        ))}
        <button type="button" className="block border-2 p-0.5" onClick={onTagAdd}>
          Add Tag #{tagTypes.length}
        </button>

        <select
          value={sauceType}
          onChange={(e) => setSauceType(e.target.value as typeof sauceType)}
          className="block"
        >
          {Object.entries(SOURCE_NAME).map(([val, name]) => (
            <option value={val} key={val}>
              {name}
            </option>
          ))}
        </select>

        {sauceType !== "OC" && (
          <input
            value={sauce}
            onChange={(e) => setSauce(e.target.value)}
            placeholder="sauce..."
            className="block border-2"
          />
        )}

        {editVis && (
          <select
            value={vis}
            onChange={(e) => setVis(e.target.value as Visibility)}
            className="block"
          >
            {Object.keys(Visibility).map((v) => (
              <option value={v} key={v}>
                {toTitleCase(v)}
              </option>
            ))}
          </select>
        )}

        <Button type="submit" className="block">
          {buttonText}
        </Button>

        <Button type="reset" className="block" onClick={clearForm}>
          Reset Form
        </Button>
      </form>

      <span className="text-red-600">{err}</span>

      <div>There are {pics.length} images</div>
      {pics.map((p, i) => (
        <Image
          key={i}
          src={URL.createObjectURL(p)}
          width="0"
          height="0"
          sizes="20vw"
          alt="alt"
          style={{ width: "10%", height: "10%" }}
        />
      ))}
    </div>
  );
}
