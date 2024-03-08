"use client";

import { type FormEvent, useState } from "react";
import { parseSauce, Sauce, Tag } from "@/lib/types";
import { Visibility } from "@prisma/client";
import { sauceUrl, toTitleCase } from "@/lib/utils";
import { z } from "zod";
import { ForkOptions } from "child_process";

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


//failed attempt #1 to get it working
//doesn't work because JS forgets that readAsDataUrl is supposed to allow files
export function ImgPreview(uploadedImg: File){
  
  let imgSrc;

  imgSrc = URL.createObjectURL(uploadedImg)
  return(<image src={imgSrc} />);  
}


export function PostForm({
  iPics = [],
  iTitle = "",
  iTags = "",
  iSauce = { src: "OTHER", id: "" },
  iVis = Visibility.PUBLIC,
  editVis = false,
  buttonText = "submit",
  onSubmit, // why the hell is next js giving warnings on these two
}: {
  iPics?: File[];
  iTitle?: string;
  iTags?: string;
  iSauce?: z.infer<typeof Sauce>;
  iVis?: Visibility;
  editVis?: boolean;
  buttonText?: string;
  onSubmit: (pd: PostData) => void;
}) {
  const [pics, setPics] = useState<File[]>(iPics);
  const [title, setTitle] = useState(iTitle);
  const [tags, setTags] = useState(iTags);
  const [sauce, setSauce] = useState(iSauce.id);
  const sourceType = sauceUrl(iSauce.src, iSauce.id) === null ? "AUTO" : iSauce.src;
  const [sauceType, setSauceType] = useState<keyof typeof SOURCE_NAME>(sourceType);
  const [vis, setVis] = useState<Visibility>(iVis);
  const [err, setErr] = useState("");
  const preview = document.querySelector("#preview");
  const rows = []
  //commented out failed attempt #1
  for(let i = 0; i<pics.length; i++){
    rows.push(<ImgPreview uploadedImg={pics[i]} />)
  }
  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // this is so cursed omg
    let goodTags;
    try {
      goodTags = tags
        .split(/\s+/)
        .filter((t) => t)
        .map((t) => {
          const [category, name] = t.split(":");
          // the "as" is just to get ts to stop yapping LOL
          return Tag.parse({ category, name });
        });
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

  return (
    <div className="space-y-2">
      <form onSubmit={formSubmit} className="space-y-2">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            //second method that fails because preview is null when the first img is uploaded for some reason
            setPics([...pics, ...Array.from(e.target.files!)]);
            /*const reader = new FileReader();
            reader.addEventListener(
              "load",
              () => {
                const image = new Image();
                image.src = reader.result;
                image.height = 200
                image.width = 200
                preview?.appendChild(image)
              },
              false,
            );
            for(let i = 0; i<e.target.files.length; i++) {
              reader.readAsDataURL(e.target.files[i]);
            }*/         
          }}
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tags..."
          className="block border-2"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title..."
          className="block border-2"
        />

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
      <span className="text-red-600">{err}</span>
      
      <div id="preview">There are {pics.length} images</div>
      {rows}
    </div>
  );
}