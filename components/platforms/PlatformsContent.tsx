"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { getPlatformIcon } from "@/lib/platform-icons";
import Link from "next/link";

interface Platform {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string;
}

interface PlatformsContentProps {
  platforms: Platform[];
}

const PLATFORM_DESCRIPTIONS: Record<string, string> = {
  pc: "The ultimate gaming platform with endless possibilities and powerful performance.",
  playstation5:
    "Next-gen gaming with lightning fast load times and stunning visuals.",
  "playstation4": "A massive library of games and beloved classics on PS4.",
  "xbox-series-x":
    "Next-gen performance with Xbox Velocity Architecture and Game Pass.",
  "xbox-one":
    "Great games, multiplayer, and entertainment all in one place.",
  "nintendo-switch":
    "Play at home or on the go with Nintendo's versatile hybrid console.",
  ios: "Premium gaming on the go with Apple's mobile ecosystem.",
  android: "Great games in your pocket. Play anywhere, anytime on Android.",
  mac: "Play your favorite games optimized for macOS.",
  linux: "Open source gaming for Linux enthusiasts.",
};

function getPlatformDescription(slug: string, name: string): string {
  return (
    PLATFORM_DESCRIPTIONS[slug] ??
    `Explore games available on ${name}.`
  );
}

type SortOption = "name-asc" | "name-desc" | "most-games";

export function PlatformsContent({ platforms }: PlatformsContentProps) {
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

  const filteredPlatforms = useMemo(() => {
    let list = [...platforms];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
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
    }

    return list;
  }, [platforms, search, sort]);

  const totalGames = platforms.reduce((sum, p) => sum + p.games_count, 0);

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
              Search Platforms
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
                placeholder='Search platforms...'
                className='w-full rounded-xs border border-border bg-secondary py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none'
              />
            </div>
          </div>

          <div>
            <p className='mb-3 text-sm font-medium text-foreground'>
              Sort By
            </p>
            <div className='flex flex-col gap-2.5 text-sm'>
              {[
                { value: "name-asc", label: "Name A-Z" },
                { value: "name-desc", label: "Name Z-A" },
                { value: "most-games", label: "Most Games" },
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

          {filteredPlatforms.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 rounded-xs border border-border bg-card py-20 text-center'>
              <p className='text-lg font-semibold text-foreground'>
                No platforms found
              </p>
              <p className='text-sm text-muted-foreground'>
                Try adjusting your search.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3'>
              {filteredPlatforms.map((platform) => {
                const Icon = getPlatformIcon(platform.slug);
                return (
                  <Link
                    key={platform.id}
                    href={`/explore?platforms=${platform.id}`}
                    className='group relative h-56 overflow-hidden rounded-xs border border-border'
                  >
                    {platform.image_background ? (
                      <img
                        src={platform.image_background}
                        alt={platform.name}
                        className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      />
                    ) : (
                      <div className='absolute inset-0 bg-secondary' />
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20' />

                    <div className='relative z-10 flex h-full flex-col justify-between p-4'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xs bg-white/10 text-base backdrop-blur'>
                          <Icon className='h-5 w-5' />
                        </div>
                        <div>
                          <p className='font-bold leading-tight text-white'>
                            {platform.name}
                          </p>
                          <p className='text-xs text-gray-300'>
                            {platform.games_count.toLocaleString()} games
                          </p>
                        </div>
                      </div>

                      <p className='max-w-md text-sm leading-relaxed text-gray-200'>
                        {getPlatformDescription(
                          platform.slug,
                          platform.name,
                        )}
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
