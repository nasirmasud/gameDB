"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_OPTIONS = [
  { value: "-added", label: "Popularity" },
  { value: "-rating", label: "Top Rated" },
  { value: "-released", label: "Newest" },
  { value: "released", label: "Oldest" },
  { value: "name", label: "Name (A-Z)" },
  { value: "-metacritic", label: "Metacritic" },
];

export function ExploreToolbar() {
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

  const sidebarOpen = searchParams.get("sidebar") === "1";

  return (
    <div className='flex items-center gap-3 text-sm'>
      <button
        onClick={() => updateParam("sidebar", sidebarOpen ? null : "1")}
        className='flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 hover:bg-accent lg:hidden'
      >
        <span>☰</span> Filters
      </button>
      <span className='hidden text-muted-foreground sm:inline'>Sort by:</span>
      <select
        value={searchParams.get("ordering") ?? "-added"}
        onChange={(e) => updateParam("ordering", e.target.value)}
        className='rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-ring focus:outline-none'
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
