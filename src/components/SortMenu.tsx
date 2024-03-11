"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortMenu({
  options,
  initVal,
  placeholder,
}: {
  options: string[];
  initVal: string;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  return (
    <Select
      onValueChange={(v) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("cursor");
        params.set("sort", v);
        router.push(`${pathname}?${params.toString()}`);
      }}
      value={initVal}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem value={o} key={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
