"use client";

import { PlatformIcons } from "@/components/games/PlatformIcons";
import { Skeleton } from "@/components/ui/skeleton";
import type { RawgGameSummary } from "@/lib/rawg";
import { Award, Meh, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface GameCardProps {
  game: RawgGameSummary;
}

type RatingTier = "exceptional" | "recommended" | "meh" | "skip";

function getRatingTier(rating: number): RatingTier | null {
  if (rating >= 4.5) return "exceptional";
  if (rating >= 4) return "recommended";
  if (rating >= 3) return "meh";
  if (rating > 0) return "skip";
  return null;
}

const tierIcon: Record<RatingTier, { icon: React.ReactNode; label: string }> = {
  exceptional: { icon: <Award className='h-[50px] w-[50px] text-amber-500' />, label: "Exceptional" },
  recommended: { icon: <ThumbsUp className='h-[50px] w-[50px] text-blue-500' />, label: "Recommended" },
  meh: { icon: <Meh className='h-[50px] w-[50px] text-muted-foreground' />, label: "Mixed" },
  skip: { icon: <ThumbsDown className='h-[50px] w-[50px] text-red-500' />, label: "Skip" },
};

function getRatingColor(rating: number) {
  if (rating >= 4.5) return "text-primary";
  if (rating >= 3.5) return "text-yellow-400";
  return "text-red-400";
}

export function GameCard({ game }: GameCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ratingOutOf10 = (game.rating * 2).toFixed(1);
  const tier = getRatingTier(game.rating);

  return (
    <Link
      href={`/games/${game.id}`}
      className='group relative flex w-full shrink-0 flex-col overflow-hidden rounded-sm border border-border bg-card transition-transform hover:-translate-y-1'
    >
      <div className='relative aspect-[4/5] w-full overflow-hidden bg-secondary'>
        {!imageLoaded && <Skeleton className='absolute inset-0 rounded-none' />}
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes='(max-width: 768px) 320px, 440px'
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground'>
            No image
          </div>
        )}

        {tier && (
          <div
            className='absolute right-2 top-2 drop-shadow-lg'
            title={tierIcon[tier].label}
          >
            {tierIcon[tier].icon}
          </div>
        )}

        <div className='absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <span className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'>
            View Details
          </span>
        </div>
      </div>

      <div className='flex flex-col gap-2 p-3'>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground'>
            {game.name}
          </h3>
        </div>

        <div className='flex items-center justify-between'>
          <PlatformIcons platforms={game.platforms} />

          <span
            className={`flex items-center gap-1 text-xs font-semibold ${getRatingColor(
              game.rating,
            )}`}
          >
            <Star className='h-3.5 w-3.5 fill-current' />
            {ratingOutOf10}
          </span>
        </div>
      </div>
    </Link>
  );
}
