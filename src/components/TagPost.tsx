"use client";

import { useState } from "react";
import { Tag } from "@/lib/types";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form,
         FormControl,
         FormDescription,
         FormField,
         FormItem,
         FormLabel,
         FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TagPost2({ pid }: { pid: string }) {
  const [tag, setTag] = useState("");
  const router = useRouter();
  const tagPost = api.post.tag.useMutation({
    onSuccess: () => router.refresh(),
  });

  // https://ui.shadcn.com/docs/components/form

  // 1. Define your form.
  const formSchema = z.object({})
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const tagList = tag.split(/\s+/).map((t) => {
            const [category, name] = t.split(":");
            return Tag.parse({ category, name });
          });
          tagPost.mutate({ post: pid, tags: tagList });
        }}
      >
        <FormField
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <Input onChange={(e) => setTag(e.target.value)} className="border" />
              <Button type="submit" className="border-2">
                tag post
              </Button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

 
export function TagPost() {
  // 1. Define your form.
  
  const formSchema = z.object({})
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tagpost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag post</FormLabel>
              <FormControl>
                <Input placeholder="LOCATION:los-angeles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
