"use client";

import { z } from "zod";
import { Tag } from "@/lib/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagCategory } from "@prisma/client";
import { toTitleCase } from "@/lib/utils";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function AddTagForm({
  pid,
  buttonText = "Add Tag",
}: {
  pid: string;
  buttonText?: string;
}) {
  const router = useRouter();
  const addTag = api.post.tag.useMutation({ onSuccess: () => router.refresh() });
  return (
    <TagForm
      buttonText={buttonText}
      onSubmit={(t) => addTag.mutate({ post: pid, tags: [t] })}
    />
  );
}

export function TagForm({
  buttonText = "Add Tag",
  initCat = TagCategory.CHARACTER,
  initContent = "",
  onSubmit = () => {},
}: {
  buttonText?: string;
  initCat?: TagCategory;
  initContent?: string;
  onSubmit?: (t: z.infer<typeof Tag>) => any;
}) {
  const [cat, setCat] = useState<TagCategory>(initCat);
  const [name, setName] = useState(initContent);

  const submitTag = () => onSubmit(Tag.parse({ category: cat, name }));
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tag</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="name" className="sr-only">
            Tag Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("submit tag");
              }
            }}
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Select onValueChange={(e: TagCategory) => setCat(e)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={toTitleCase(cat)} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(TagCategory).map((v) => (
                <SelectItem value={v} key={v}>
                  {toTitleCase(v)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button onClick={submitTag}>Submit Tag</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
