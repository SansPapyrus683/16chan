"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Visibility } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toTitleCase } from "@/lib/utils";

export function CreateAlbum() {
  const router = useRouter();
  const create = api.album.create.useMutation({
    onSuccess: (data) => {
      setButtonText("Created!");
      router.push(`/album/${data.id}`);
    },
  });
  const [name, setName] = useState("New Album");
  const [vis, setVis] = useState<Visibility>("PUBLIC");
  const [buttonText, setButtonText] = useState("Create");

  const createAlbum = () => {
    setButtonText("Creating...");
    create.mutate({
      name,
      visibility: vis,
    });
  };

  return (
    <>
      <Dialog onOpenChange={() => setButtonText("Create")}>
        <DialogTrigger className="border-2 p-1">Create Album</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
            <DialogDescription>Make a collection of posts</DialogDescription>
          </DialogHeader>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Album Name
            </Label>
            <Input
              id="link"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createAlbum();
                }
              }}
            />
          </div>
          <div className="grid flex-1 gap-2">
            <Select onValueChange={(e: Visibility) => setVis(e as Visibility)}>
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
          </div>
          <DialogFooter className="sm:justify-between">
            <button
              className="rounded-md border-2 p-2"
              type="submit"
              onClick={createAlbum}
            >
              {buttonText}
            </button>
            <DialogClose className="rounded-md border-2 bg-black p-2 text-white">
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
