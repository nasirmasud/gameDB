"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
}

interface ExploreFiltersProps {
  genres: Genre[];
  platforms: Platform[];
}

const SORT_OPTIONS = [
  { value: "-added", label: "Popularity" },
  { value: "-rating", label: "Top Rated" },
  { value: "-released", label: "Newest" },
  { value: "released", label: "Oldest" },
  { value: "name", label: "Name (A-Z)" },
  { value: "-metacritic", label: "Metacritic" },
];

export function ExploreFilters({ genres, platforms }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className='mb-8 flex flex-wrap gap-3'>
      <select
        value={searchParams.get("genres") ?? ""}
        onChange={(e) => updateParam("genres", e.target.value || null)}
        className='rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <option value=''>All Genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.slug}>
            {g.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("platforms") ?? ""}
        onChange={(e) => updateParam("platforms", e.target.value || null)}
        className='rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <option value=''>All Platforms</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("ordering") ?? "-added"}
        onChange={(e) => updateParam("ordering", e.target.value)}
        className='rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
