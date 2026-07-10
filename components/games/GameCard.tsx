import { PlatformIcons } from "@/components/games/PlatformIcons";
import type { RawgGameSummary } from "@/lib/rawg";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GameCardProps {
  game: RawgGameSummary;
}

function getRatingColor(rating: number) {
  if (rating >= 4.5) return "text-primary";
  if (rating >= 3.5) return "text-yellow-400";
  return "text-red-400";
}

export function GameCard({ game }: GameCardProps) {
  const ratingOutOf10 = (game.rating * 2).toFixed(1);

  return (
    <Link
      href={`/games/${game.id}`}
      className='group relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1'
    >
      <div className='relative aspect-[4/5] w-full overflow-hidden'>
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes='(max-width: 768px) 320px, 440px'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground'>
            No image
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
