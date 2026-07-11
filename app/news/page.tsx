import { PlatformIcons } from "@/components/games/PlatformIcons";
import { getGames } from "@/lib/rawg";
import { Clock, Gamepad2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "TBA";
  const released = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - released.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
}

export default async function NewsPage() {
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const from = ninetyDaysAgo.toISOString().split("T")[0];
  const to = today.toISOString().split("T")[0];

  const { results } = await getGames({
    dates: `${from},${to}`,
    ordering: "-released",
    page_size: 15,
  });

  return (
    <div className='mx-auto w-full px-8 py-10 md:px-12 lg:px-16'>
      <h1 className='mb-2 text-2xl font-bold text-foreground'>Game News</h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        Recent releases and updates from the gaming world.
      </p>

      {results.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card py-20 text-center'>
          <p className='text-lg font-semibold text-foreground'>
            No recent releases found
          </p>
          <p className='text-sm text-muted-foreground'>
            Check back soon for updates.
          </p>
        </div>
      ) : (
        <div className='flex flex-col divide-y divide-border'>
          {results.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className='group flex items-center gap-8 py-8'
            >
              <div className='flex min-w-0 flex-1 flex-col gap-2'>
                <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                  <Gamepad2 className='h-3.5 w-3.5 text-primary' />
                  GameDB
                </div>

                <h2 className='text-xl font-bold text-foreground group-hover:underline sm:text-2xl'>
                  {game.name}
                </h2>

                <p className='text-sm leading-relaxed text-muted-foreground sm:text-base'>
                  {game.genres.map((g) => g.name).join(", ") || "Game"} —
                  released on{" "}
                  {new Date(game.released!).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {game.metacritic
                    ? ` with a Metacritic score of ${game.metacritic}`
                    : ""}
                  .
                </p>

                {/* Rating + Platforms + Playtime row */}
                <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                  {game.rating > 0 && (
                    <span className='flex items-center gap-1 font-semibold text-yellow-400'>
                      <Star className='h-4 w-4 fill-current' />
                      {(game.rating * 2).toFixed(1)}
                      <span className='ml-1 font-normal text-muted-foreground'>
                        ({game.ratings_count.toLocaleString()} ratings)
                      </span>
                    </span>
                  )}

                  {game.platforms?.length > 0 && (
                    <PlatformIcons platforms={game.platforms} />
                  )}

                  {game.playtime > 0 && (
                    <span className='flex items-center gap-1'>
                      <Clock className='h-3.5 w-3.5' />~{game.playtime}h to
                      complete
                    </span>
                  )}
                </div>

                <div className='mt-1 flex flex-wrap items-center gap-2'>
                  {game.genres.slice(0, 3).map((g) => (
                    <span
                      key={g.id}
                      className='rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
                    >
                      {g.name}
                    </span>
                  ))}
                  <span className='text-xs text-muted-foreground'>
                    {timeAgo(game.released)}
                  </span>
                </div>
              </div>

              <div className='relative h-40 w-64 shrink-0 overflow-hidden rounded-xl sm:h-48 sm:w-80'>
                {game.background_image ? (
                  <Image
                    src={game.background_image}
                    alt={game.name}
                    fill
                    sizes='320px'
                    className='object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground'>
                    No image
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
