"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className='hidden md:flex flex-1 max-w-xl'>
      <div className='relative w-full'>
        <Search className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Search for games...'
          className='w-full rounded-full border border-input bg-secondary/60 py-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
        />
        <Search className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      </div>
    </div>
  );
}
