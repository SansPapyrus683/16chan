"use client";

import { type FormEvent, useState } from "react";
import { parseSauce, Sauce, Tag } from "@/lib/types";
import { Visibility } from "@prisma/client";
import { sauceUrl, toTitleCase } from "@/lib/utils";
import Image from "next/image";
import { z } from "zod";

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

export function TagForm(
  { tagType, tagContent, tagNumber, onTypeChange, onContentChange, onDelete}
 : { tagType: string, tagContent: string, tagNumber: number, onTypeChange : Function, onContentChange: Function, onDelete: Function}
   ) {

  
  return (
  <div>
    Tag #{tagNumber}
    <button className="block border-2 p-0.5" onClick={onDelete(tagNumber)}>
      Delete Tag
    </button>
    <input type="radio" id="char" name="tagType" checked={tagType == "CHARACTER"} onClick={onTypeChange(tagNumber, "CHARACTER")} />
    <label htmlFor="char" >Character</label>
    <input type="radio" id="loc" name="tagType" checked={tagType == "LOCATION"} onClick={onTypeChange(tagNumber, "LOCATION")} />
    <label htmlFor="loc">Location</label>
    <input type="radio" id="media" name="tagType" checked={tagType == "MEDIA"} onClick={onTypeChange(tagNumber, "MEDIA")} />
    <label htmlFor="media">Media</label>
    <input type="radio" id="other" name="tagType" checked={tagType == "OTHER"} onClick={onTypeChange(tagNumber, "OTHER")} />
    <label htmlFor="other" >Other</label>
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
    let goodTags = [];
    try {
      for(let i = 0; i < tagTypes.length; i++)
      {
        let category = tagTypes[i];
        let name = tagContents[i];
        goodTags.push(Tag.parse({ category, name }));
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

  function clearForm(){
    setPics([]);
    setTitle("");
    setTagTypes([]);
    setTagContents([]);
    setSauce("");
    setVis(Visibility.PUBLIC);
    setSauceType("AUTO");
  }

  function onTagTypeChange(tagIndex: number, newType: string){
    const newTypes: string[] = [];
    
    for(let i = 0; i < tagTypes.length; i++){
      if(i != tagIndex){ 
        newTypes.push(tagTypes[i]!);
      }
      else newTypes.push(newType);
    } 
    setTagTypes(newTypes);
  } 
  function onTagContentChange(tagIndex: number, newContent: string){
    const newContents: string[] = [];  
    for(let i = 0; i < tagContents.length; i++){
      if(i != tagIndex){ 
        newContents.push(tagContents[i]!);
      }
      else newContents.push(newContent);
    } 
    setTagContents(newContents);
  }

  function onTagDelete(tagIndex: number){
    const newTypes: string[] = [];
    const newContents: string[] = [];  
    for(let i = 0; i < tagContents.length; i++){
      if(i != tagIndex){ 
        newTypes.push(tagTypes[i]!);
        newContents.push(tagContents[i]!);
      }
    } 
    setTagContents(newContents);
    setTagTypes(newTypes);
  }

  function onTagAdd(){
    const newTypes: string[] = [];
    const newContents: string[] = [];  
    for(let i = 0; i < tagContents.length; i++){
      newTypes.push(tagTypes[i]!);
      newContents.push(tagContents[i]!);
    }
    newTypes.push("CHARACTER");
    newContents.push(""); 
    setTagContents(newContents);
    setTagTypes(newTypes);
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
    
        {tagTypes.map((t, i) => (
          <TagForm
            tagType={tagTypes[i]!}
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

        <button type="submit" className="block border-2 p-0.5">
          {buttonText}
        </button>
      </form>
      <button className="block border-2 p-0.5" onClick={clearForm}>
        Reset Form
      </button>
      <span className="text-red-600">{err}</span>

      <div>There are {pics.length} images</div>
      {pics.map((p, i) => (
        <Image
          key={i}
          src={URL.createObjectURL(p)}
          width="0"
          height="0"
          sizes="100vw"
          alt="alt"
          style={{ width: "25%", height: "auto" }}
        />
      ))}
    </div>
  );
}
