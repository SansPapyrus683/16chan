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
import { Button } from "@/components/ui/button";

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
        <DialogTrigger asChild>
          <Button variant="outline">Create Album</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Album</DialogTitle>
            <DialogDescription>Make a collection of posts.</DialogDescription>
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
            <Button onClick={createAlbum}>{buttonText}</Button>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
