"use client";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <label className="relative w-96 text-gray-400 focus-within:text-gray-600">
      <SearchIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform" />
      <Input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const params = new URLSearchParams([["q", query]]);
            router.push(`/?${params.toString()}`);
          }
        }}
      />
    </label>
  );
}
