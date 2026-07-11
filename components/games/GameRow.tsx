"use client";

import { GameCard } from "@/components/games/GameCard";
import { GameCardSkeleton } from "@/components/games/GameCardSkeleton";
import type { RawgGameSummary } from "@/lib/rawg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface GameRowProps {
  title: string;
  viewAllHref: string;
  games: RawgGameSummary[];
  isLoading?: boolean;
}

export function GameRow({
  title,
  viewAllHref,
  games,
  isLoading,
}: GameRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className='mx-auto w-full px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-foreground'>{title}</h2>
        <Link
          href={viewAllHref}
          className='text-sm font-medium text-primary hover:underline'
        >
          View All →
        </Link>
      </div>

      <div className='relative'>
        <div
          ref={scrollRef}
          className='flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='w-[180px] shrink-0 sm:w-[220px] lg:w-[240px]'
                >
                  <GameCardSkeleton />
                </div>
              ))
            : games.map((game) => (
                <div
                  key={game.id}
                  className='w-[180px] shrink-0 sm:w-[220px] lg:w-[240px]'
                >
                  <GameCard game={game} />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll("left")}
          aria-label='Scroll left'
          className='absolute -left-4 top-1/3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-secondary lg:flex'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label='Scroll right'
          className='absolute -right-4 top-1/3 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-secondary lg:flex'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </section>
  );
}
