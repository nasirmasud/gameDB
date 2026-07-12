"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
  games_count: number;
}

interface ExploreFiltersProps {
  genres: Genre[];
  platforms: Platform[];
}

const INITIAL_VISIBLE = 8;

export function ExploreFilters({ genres, platforms }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const sidebarOpen = searchParams.get("sidebar") === "1";

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

  function toggleArrayParam(key: string, item: string) {
    const current = searchParams.get(key) ?? "";
    const items = current ? current.split(",") : [];
    const idx = items.indexOf(item);
    if (idx === -1) {
      items.push(item);
    } else {
      items.splice(idx, 1);
    }
    updateParam(key, items.length > 0 ? items.join(",") : null);
  }

  function isSelected(key: string, item: string) {
    const current = searchParams.get(key) ?? "";
    return current.split(",").includes(item);
  }

  function clearAll() {
    router.push(pathname);
  }

  const displayedGenres = showAllGenres
    ? genres
    : genres.slice(0, INITIAL_VISIBLE);
  const displayedPlatforms = showAllPlatforms
    ? platforms
    : platforms.slice(0, INITIAL_VISIBLE);

  const sidebarMobile = sidebarOpen
    ? "fixed inset-0 z-50 flex-col bg-background p-6 overflow-y-auto"
    : "hidden";

  return (
    <>
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-background/60 lg:hidden'
          onClick={() => updateParam("sidebar", null)}
        />
      )}

      <aside
        className={`${sidebarMobile} flex-col gap-6 lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-auto lg:bg-transparent lg:p-0 lg:overflow-visible`}
      >
        {sidebarOpen && (
          <div className='mb-4 flex items-center justify-between lg:hidden'>
            <h2 className='text-lg font-bold text-foreground'>Filters</h2>
            <button
              onClick={() => updateParam("sidebar", null)}
              className='text-sm text-muted-foreground'
            >
              ✕
            </button>
          </div>
        )}

        <div className='hidden items-center justify-between lg:flex'>
          <h2 className='text-lg font-bold text-foreground'>Filters</h2>
          <button
            onClick={clearAll}
            className='text-sm text-ring hover:underline'
          >
            Clear All
          </button>
        </div>

        <div>
          <p className='mb-3 text-sm font-medium text-foreground'>Genres</p>
          <div className='flex flex-col gap-2.5 text-sm'>
            {displayedGenres.map((genre) => (
              <label
                key={genre.id}
                className='group flex cursor-pointer items-center justify-between'
              >
                <span className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={isSelected("genres", genre.slug)}
                    onChange={() => toggleArrayParam("genres", genre.slug)}
                    className='accent-ring'
                  />
                  <span className='text-muted-foreground group-hover:text-foreground'>
                    {genre.name}
                  </span>
                </span>
                <span className='text-muted-foreground'>
                  {genre.games_count}
                </span>
              </label>
            ))}
          </div>
          {genres.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAllGenres(!showAllGenres)}
              className='mt-3 flex items-center gap-1 text-sm text-ring hover:underline'
            >
              {showAllGenres ? "Show Less" : "Show More"}{" "}
              <span>{showAllGenres ? "⌃" : "⌄"}</span>
            </button>
          )}
        </div>

        <div className='border-t border-border pt-2'>
          <p className='mb-3 mt-4 text-sm font-medium text-foreground'>
            Platforms
          </p>
          <div className='flex flex-col gap-2.5 text-sm'>
            {displayedPlatforms.map((platform) => (
              <label
                key={platform.id}
                className='group flex cursor-pointer items-center justify-between'
              >
                <span className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={isSelected("platforms", String(platform.id))}
                    onChange={() =>
                      toggleArrayParam("platforms", String(platform.id))
                    }
                    className='accent-ring'
                  />
                  <span className='text-muted-foreground group-hover:text-foreground'>
                    {platform.name}
                  </span>
                </span>
                <span className='text-muted-foreground'>
                  {platform.games_count}
                </span>
              </label>
            ))}
          </div>
          {platforms.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setShowAllPlatforms(!showAllPlatforms)}
              className='mt-3 flex items-center gap-1 text-sm text-ring hover:underline'
            >
              {showAllPlatforms ? "Show Less" : "Show More"}{" "}
              <span>{showAllPlatforms ? "⌃" : "⌄"}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
