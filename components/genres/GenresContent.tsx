"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { getGenreIcon } from "@/lib/genre-icons";
import Link from "next/link";

interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

interface GenresContentProps {
  genres: Genre[];
}

const GENRE_COLORS: Record<string, string> = {
  action: "bg-purple-600",
  "role-playing-games-rpg": "bg-blue-700",
  shooter: "bg-red-600",
  adventure: "bg-green-600",
  racing: "bg-orange-600",
  strategy: "bg-teal-600",
  simulation: "bg-blue-600",
  sports: "bg-green-700",
  puzzle: "bg-yellow-600",
  horror: "bg-purple-800",
  fighting: "bg-gray-700",
  family: "bg-pink-600",
  arcade: "bg-indigo-600",
  indie: "bg-indigo-600",
  "massively-multiplayer": "bg-cyan-600",
  "board-games": "bg-amber-700",
  educational: "bg-sky-600",
  card: "bg-rose-700",
};

const GENRE_DESCRIPTIONS: Record<string, string> = {
  action: "Fast-paced gameplay focused on combat, reflexes, and challenges.",
  adventure: "Story-driven experiences that emphasize exploration and puzzle-solving.",
  "role-playing-games-rpg":
    "Role-playing games focused on character development and storytelling.",
  shooter: "Gun-based combat in first-person or third-person perspectives.",
  strategy: "Tactical planning and resource management to achieve victory.",
  sports: "Realistic sports simulations and competitive athletic games.",
  racing: "High-speed competitions and driving simulation experiences.",
  indie: "Creative games from independent developers with unique ideas.",
  puzzle: "Brain-teasing challenges that test logic and problem-solving.",
  arcade: "Classic fast-paced games designed for quick play sessions.",
  "massively-multiplayer":
    "Vast online worlds where thousands of players interact simultaneously.",
  simulation: "Real-life activities simulated in immersive environments.",
  fighting: "Head-to-head combat with unique characters and moves.",
  family: "Games suitable for all ages with fun and engaging content.",
  "board-games":
    "Digital adaptations of classic and modern board game experiences.",
  educational:
    "Games designed to teach and develop knowledge or skills.",
  card: "Card-based games from classic decks to collectible card games.",
  horror: "Atmospheric experiences designed to scare and thrill.",
};

function getGenreColor(slug: string): string {
  return GENRE_COLORS[slug] ?? "bg-secondary";
}

function getGenreDescription(slug: string, name: string): string {
  return (
    GENRE_DESCRIPTIONS[slug] ??
    `Explore games in the ${name} genre.`
  );
}

type SortOption = "name-asc" | "name-desc" | "most-games" | "top-rated";

export function GenresContent({ genres }: GenresContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sidebarOpen = searchParams.get("sidebar") === "1";
  const search = searchParams.get("search") ?? "";
  const sort = (searchParams.get("sort") ?? "name-asc") as SortOption;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearAll() {
    router.push(pathname);
  }

  const filteredGenres = useMemo(() => {
    let list = [...genres];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "most-games":
        list.sort((a, b) => b.games_count - a.games_count);
        break;
      case "top-rated":
        list.sort((a, b) => b.games_count - a.games_count);
        break;
    }

    return list;
  }, [genres, search, sort]);

  const totalGames = genres.reduce((sum, g) => sum + g.games_count, 0);

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

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8 xl:grid-cols-[260px_1fr]'>
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
            <p className='mb-2 text-sm font-medium text-foreground'>
              Search Genres
            </p>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                🔍
              </span>
              <input
                type='text'
                value={search}
                onChange={(e) =>
                  updateParam("search", e.target.value || null)
                }
                placeholder='Search genres...'
                className='w-full rounded-xs border border-border bg-secondary py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none'
              />
            </div>
          </div>

          <div>
            <p className='mb-3 text-sm font-medium text-foreground'>Sort By</p>
            <div className='flex flex-col gap-2.5 text-sm'>
              {[
                { value: "name-asc", label: "Name A-Z" },
                { value: "name-desc", label: "Name Z-A" },
                { value: "most-games", label: "Most Games" },
                { value: "top-rated", label: "Highest Rated" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className='flex cursor-pointer items-center gap-2'
                >
                  <input
                    type='radio'
                    name='sort'
                    checked={sort === opt.value}
                    onChange={() => updateParam("sort", opt.value)}
                    className='accent-ring'
                  />
                  <span className='text-muted-foreground'>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className='mb-4 flex items-center justify-between lg:hidden'>
            <button
              onClick={() =>
                updateParam("sidebar", sidebarOpen ? null : "1")
              }
              className='flex items-center gap-2 rounded-xs border border-border bg-secondary px-3 py-2 text-sm hover:bg-accent'
            >
              <span>☰</span> Filters
            </button>
          </div>

          {filteredGenres.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 rounded-xs border border-border bg-card py-20 text-center'>
              <p className='text-lg font-semibold text-foreground'>
                No genres found
              </p>
              <p className='text-sm text-muted-foreground'>
                Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2'>
              {filteredGenres.map((genre) => {
              const Icon = getGenreIcon(genre.slug);
              return (
                <Link
                  key={genre.id}
                  href={`/explore?genres=${genre.slug}`}
                  className='flex flex-col overflow-hidden rounded-xs border border-border bg-secondary transition-colors hover:border-ring sm:flex-row min-h-56'
                >
                  <div className='relative h-80 w-full shrink-0 overflow-hidden sm:h-auto sm:w-64'>
                    {genre.image_background ? (
                      <img
                        src={genre.image_background}
                        alt={genre.name}
                        className='h-full w-full object-cover'
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${genre.image_background ? 'bg-background/50' : getGenreColor(genre.slug)}`}
                    >
                      <Icon className='h-10 w-10 text-white' />
                    </div>
                  </div>
                    <div className='flex flex-1 flex-col justify-center gap-2 p-5'>
                      <div>
                        <p className='text-lg font-semibold leading-tight text-foreground'>
                          {genre.name}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {genre.games_count.toLocaleString()} games
                        </p>
                      </div>
                      <p className='text-base leading-relaxed text-muted-foreground'>
                        {getGenreDescription(genre.slug, genre.name)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
