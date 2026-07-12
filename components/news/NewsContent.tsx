"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Eye,
  Bookmark,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { RawgGameSummary } from "@/lib/rawg";

interface NewsContentProps {
  games: RawgGameSummary[];
}

const CATEGORIES = [
  "All",
  "News",
  "Reviews",
  "Guides",
  "Industry",
  "Hardware",
];

const SORT_OPTIONS = [
  { value: "-released", label: "Latest" },
  { value: "released", label: "Oldest" },
  { value: "-ratings_count", label: "Most Commented" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createExcerpt(game: RawgGameSummary) {
  const genreNames = game.genres
    .slice(0, 3)
    .map((g) => g.name)
    .join(", ");
  const date = game.released
    ? new Date(game.released).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";
  let text = `${genreNames || "Game"} — released on ${date}.`;
  if (game.metacritic) {
    text += ` With a Metacritic score of ${game.metacritic}.`;
  }
  return text;
}

export function NewsContent({ games }: NewsContentProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("-released");
  const [visibleCount, setVisibleCount] = useState(5);

  const featured = games[0];
  const sideNews = games.slice(1, 4);
  const allNews = games.slice(4);

  const sortedAllNews = useMemo(() => {
    const list = [...allNews];
    switch (sortBy) {
      case "-released":
        list.sort(
          (a, b) =>
            new Date(b.released ?? 0).getTime() -
            new Date(a.released ?? 0).getTime(),
        );
        break;
      case "released":
        list.sort(
          (a, b) =>
            new Date(a.released ?? 0).getTime() -
            new Date(b.released ?? 0).getTime(),
        );
        break;
      case "-ratings_count":
        list.sort((a, b) => b.ratings_count - a.ratings_count);
        break;
    }
    return list;
  }, [allNews, sortBy]);

  const visibleNews = sortedAllNews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAllNews.length;

  const trending = useMemo(
    () =>
      [...games]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5),
    [games],
  );

  const popular = useMemo(
    () =>
      [...games]
        .sort((a, b) => b.ratings_count - a.ratings_count)
        .slice(0, 5),
    [games],
  );

  if (!featured) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 rounded-xs border border-border bg-card py-20 text-center'>
        <p className='text-lg font-semibold text-foreground'>
          No news available
        </p>
        <p className='text-sm text-muted-foreground'>
          Check back soon for updates.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px] xl:gap-8'>
      <div className='flex min-w-0 flex-col gap-8'>
        <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
          <Link
            href={`/games/${featured.id}`}
            className='group relative h-[340px] overflow-hidden rounded-xs border border-border sm:h-[420px] lg:h-auto'
          >
            {featured.background_image ? (
              <img
                src={featured.background_image}
                alt={featured.name}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
            ) : (
              <div className='absolute inset-0 bg-secondary' />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent' />
            <span className='absolute left-4 top-4 rounded-xs bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground'>
              FEATURED
            </span>
            <div className='absolute bottom-0 left-0 right-0 p-5'>
              <p className='mb-2 text-sm text-gray-300'>
                {formatDate(featured.released)}
              </p>
              <h2 className='mb-2 text-xl font-bold leading-snug sm:text-2xl'>
                {featured.name}
              </h2>
              <p className='mb-4 max-w-lg text-sm text-gray-300'>
                {createExcerpt(featured)}
              </p>
              <div className='flex items-center justify-between'>
                <span className='flex items-center gap-1.5 text-sm text-gray-300'>
                  <MessageSquare className='h-4 w-4' />
                  {featured.ratings_count.toLocaleString()}
                </span>
                <span className='flex items-center gap-1 text-sm font-medium text-primary hover:underline'>
                  Read More <ArrowRight className='h-4 w-4' />
                </span>
              </div>
            </div>
          </Link>

          <div className='flex flex-col gap-4'>
            {sideNews.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className='group flex gap-3'
              >
                <div className='relative h-20 w-28 shrink-0 overflow-hidden rounded-xs border border-border'>
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='h-full w-full bg-secondary' />
                  )}
                  <span className='absolute left-1 top-1 rounded-xs bg-secondary/90 px-1.5 py-0.5 text-[10px] font-semibold'>
                    NEWS
                  </span>
                </div>
                <div className='min-w-0'>
                  <p className='mb-1 text-xs text-muted-foreground'>
                    {formatDate(game.released)}
                  </p>
                  <p className='mb-1.5 text-sm font-semibold leading-snug'>
                    {game.name}
                  </p>
                  <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <MessageSquare className='h-3 w-3' />
                    {game.ratings_count.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className='mb-5 flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-6'>
              <h2 className='text-xl font-bold'>All News</h2>
              <div className='flex items-center gap-5 overflow-x-auto text-sm'>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap ${
                      activeCategory === cat
                        ? "border-b-2 border-primary pb-1 font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className='flex shrink-0 items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='rounded-xs border border-border bg-secondary px-3 py-2 text-foreground focus:border-ring focus:outline-none'
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='divide-y divide-border'>
            {visibleNews.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className='group flex gap-4 py-5 first:pt-0'
              >
                <div className='h-20 w-28 shrink-0 overflow-hidden rounded-xs border border-border sm:h-24 sm:w-36'>
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='h-full w-full bg-secondary' />
                  )}
                </div>
                <div className='flex min-w-0 flex-1 flex-col'>
                  <p className='mb-1 text-xs text-muted-foreground'>
                    {formatDate(game.released)}
                  </p>
                  <p className='mb-1.5 text-sm font-semibold leading-snug sm:text-base'>
                    {game.name}
                  </p>
                  <p className='mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm'>
                    {createExcerpt(game)}
                  </p>
                  <div className='mt-auto flex items-center justify-between'>
                    <span className='flex items-center gap-3 text-xs font-medium text-primary'>
                      NEWS
                      <span className='flex items-center gap-1 text-muted-foreground'>
                        <MessageSquare className='h-3 w-3' />
                        {game.ratings_count.toLocaleString()}
                      </span>
                    </span>
                    <Bookmark className='h-4 w-4 text-muted-foreground' />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className='mt-6 flex justify-center'>
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + 5)
                }
                className='flex items-center gap-2 rounded-xs border border-border bg-secondary px-5 py-2.5 text-sm transition-colors hover:bg-accent'
              >
                Load More News <ChevronDown className='h-4 w-4' />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='rounded-xs border border-border bg-secondary p-4'>
          <h3 className='mb-4 text-lg font-bold'>Trending Now</h3>
          <div className='flex flex-col gap-4'>
            {trending.map((game, i) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className='group flex gap-3'
              >
                <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xs border border-border'>
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='h-full w-full bg-secondary' />
                  )}
                  <span className='absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold'>
                    {i + 1}
                  </span>
                </div>
                <div className='min-w-0'>
                  <p className='mb-1 line-clamp-2 text-sm font-medium leading-snug'>
                    {game.name}
                  </p>
                  <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                    <Eye className='h-3 w-3' />
                    {game.ratings_count.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className='rounded-xs border border-border bg-secondary p-4'>
          <h3 className='mb-4 text-lg font-bold'>Popular News</h3>
          <div className='flex flex-col gap-4'>
            {popular.map((game, i) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className='group flex gap-3'
              >
                <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-xs border border-border'>
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='h-full w-full bg-secondary' />
                  )}
                  <span className='absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold'>
                    {i + 1}
                  </span>
                </div>
                <div className='min-w-0'>
                  <p className='mb-1 line-clamp-2 text-sm font-medium leading-snug'>
                    {game.name}
                  </p>
                  <p className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='text-primary'>
                      {formatDate(game.released)}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Eye className='h-3 w-3' />
                      {game.ratings_count.toLocaleString()}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
