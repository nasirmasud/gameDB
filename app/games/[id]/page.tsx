import { PlatformIcons } from "@/components/games/PlatformIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getGameById,
  getGameScreenshots,
  getGameMovies,
  getGames,
  type MediaItem,
  type RawgGameSummary,
} from "@/lib/rawg";
import { ScreenshotGallery } from "@/components/games/ScreenshotGallery";
import { Heart, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameById(id);
  return {
    title: `${game.name} - GameDB`,
    description: game.description_raw?.slice(0, 160),
  };
}

function getRatingColor(rating: number) {
  if (rating >= 4.5) return "text-primary";
  if (rating >= 3.5) return "text-yellow-400";
  return "text-red-400";
}

function getRatingLabel(rating: number) {
  if (rating >= 4.5) return "Editor's Choice";
  if (rating >= 4) return "Highly Rated";
  if (rating >= 3) return "Mixed";
  return "Low Rated";
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const rest = rating - full;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <span key={i} className='text-primary'>
          ★
        </span>,
      );
    } else if (i === full && rest >= 0.25) {
      stars.push(
        <span key={i} className='text-primary'>
          ★
        </span>,
      );
    } else {
      stars.push(
        <span key={i} className='text-muted-foreground'>
          ★
        </span>,
      );
    }
  }
  return <div className='flex items-center gap-0.5'>{stars}</div>;
}

function RatingBar({
  label,
  pct,
  barClass,
}: {
  label: number;
  pct: number;
  barClass: string;
}) {
  return (
    <div className='flex items-center gap-2 text-xs'>
      <span className='w-2 text-right text-muted-foreground'>{label}</span>
      <div className='flex-1 h-1.5 rounded-full bg-secondary overflow-hidden'>
        <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className='w-8 text-right text-muted-foreground'>{pct}%</span>
    </div>
  );
}

export default async function GameDetailsPage({ params }: Props) {
  const { id } = await params;
  const [game, screenshotsRes, moviesRes] = await Promise.all([
    getGameById(id),
    getGameScreenshots(id),
    getGameMovies(id).catch(() => null),
  ]);

  const screenshots = screenshotsRes.results ?? [];
  const movies = moviesRes?.results ?? [];
  const mediaItems: MediaItem[] = [
    ...movies.map((m) => ({
      type: "movie" as const,
      id: m.id,
      preview: m.preview,
      videoUrl: m.data.max,
      name: m.name,
    })),
    ...screenshots.map((s) => ({
      type: "screenshot" as const,
      id: s.id,
      image: s.image,
    })),
  ];
  const ratingOutOf10 = (game.rating * 2).toFixed(1);
  const isHighRated = game.rating >= 4;

  const firstGenre = game.genres?.[0];
  let similarGames: RawgGameSummary[] = [];
  if (firstGenre) {
    const similarRes = await getGames({
      genres: firstGenre.slug,
      page_size: 5,
      ordering: "-rating",
    });
    similarGames = similarRes.results
      .filter((g) => g.id !== game.id)
      .slice(0, 5);
  }

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-12 xl:px-20 2xl:px-28'>
      {/* Breadcrumb */}
      <nav className='mb-6 flex items-center gap-2 text-sm text-muted-foreground max-w-screen-2xl mx-auto'>
        <Link href='/' className='hover:text-foreground transition-colors'>
          Home
        </Link>
        <span>›</span>
        <Link
          href='/explore'
          className='hover:text-foreground transition-colors'
        >
          Games
        </Link>
        {game.genres?.slice(0, 1).map((genre) => (
          <span key={genre.slug} className='contents'>
            <span>›</span>
            <Link
              href={`/explore?genres=${genre.slug}`}
              className='hover:text-foreground transition-colors'
            >
              {genre.name}
            </Link>
          </span>
        ))}
        <span>›</span>
        <span className='text-foreground truncate max-w-[200px]'>
          {game.name}
        </span>
      </nav>

      {/* Hero section: full-width cover background + overlay info */}
      <div className='relative overflow-hidden rounded-xs border border-border mb-6'>
        <div className='absolute inset-0'>
          {game.background_image ? (
            <Image
              src={game.background_image}
              alt=''
              fill
              className='object-cover'
              priority
            />
          ) : null}
          <div className='absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40' />
        </div>

        <div className='relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-8 lg:p-12 lg:grid-cols-[280px_1fr_280px]'>
          {/* Cover */}
          <div className='overflow-hidden rounded-xs border border-border shadow-2xl h-[360px] lg:h-[420px]'>
            {game.background_image ? (
              <Image
                src={game.background_image}
                alt={game.name}
                width={280}
                height={420}
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-sm'>
                No image
              </div>
            )}
          </div>

          {/* Main info */}
          <div className='flex flex-col justify-center gap-4 lg:justify-start lg:pt-8'>
            {isHighRated && (
              <div className='flex items-center gap-2 text-sm font-medium text-purple-400'>
                <Star className='h-4 w-4 fill-current' />
                <span className='tracking-wide'>
                  {getRatingLabel(game.rating)}
                </span>
              </div>
            )}

            <h1 className='text-4xl font-bold lg:text-5xl'>{game.name}</h1>

            <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
              <span
                className={`flex items-center gap-1 ${getRatingColor(game.rating)}`}
              >
                <Star className='h-4 w-4 fill-current' />
                <span className='font-semibold text-foreground'>
                  {ratingOutOf10}
                </span>
              </span>
              <span>•</span>
              <span>{game.ratings_count?.toLocaleString() ?? 0} Ratings</span>
              <span>•</span>
              <span>
                {game.genres?.map((g) => g.name).join(", ") ?? "N/A"}
              </span>
              {game.playtime > 0 && (
                <>
                  <span>•</span>
                  <span>{game.playtime}h</span>
                </>
              )}
            </div>

            <PlatformIcons platforms={game.platforms} />

            <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
              {game.description_raw?.slice(0, 400)}
              {game.description_raw?.length > 400 ? "..." : ""}
            </p>

            {/* Quick meta chips */}
            <div className='flex flex-wrap gap-x-6 gap-y-3 pt-2'>
              {game.developers?.length > 0 && (
                <div>
                  <p className='text-xs text-muted-foreground'>Developer</p>
                  <p className='text-sm font-medium'>
                    {game.developers.map((d) => d.name).join(", ")}
                  </p>
                </div>
              )}
              {game.publishers?.length > 0 && (
                <div>
                  <p className='text-xs text-muted-foreground'>Publisher</p>
                  <p className='text-sm font-medium'>
                    {game.publishers.map((d) => d.name).join(", ")}
                  </p>
                </div>
              )}
              {game.released && (
                <div>
                  <p className='text-xs text-muted-foreground'>Release Date</p>
                  <p className='text-sm font-medium'>{game.released}</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase card */}
          <Card className='rounded-xs h-fit border-border bg-card/90 backdrop-blur-sm lg:self-center'>
            <CardContent className='p-6'>
              <p className='mb-4 text-3xl font-bold'>
                {game.metacritic ? `$${game.metacritic + 20}` : "$59.99"}
              </p>
              <Button className='w-full mb-3 cursor-pointer text-base py-5'>
                Buy Now
              </Button>
              <Button
                variant='outline'
                className='w-full mb-5 flex items-center justify-center gap-2 cursor-pointer'
                size='lg'
              >
                <Heart className='h-4 w-4' /> Add to Wishlist
              </Button>

              <ul className='flex flex-col gap-3 text-sm'>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    Offline Play
                  </span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    Single Player
                  </span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    Cloud Save
                  </span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    Controller Support
                  </span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>
                    Achievements
                  </span>
                  <span className='text-primary'>✓</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content sections — full-width grid */}
      <div className='max-w-screen-2xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]'>
        {/* Main column */}
        <div className='flex flex-col gap-8 min-w-0'>
          {/* Gallery */}
          <section>
            <h2 className='mb-4 text-xl font-bold'>Media</h2>
            <ScreenshotGallery
              items={mediaItems}
              gameName={game.name}
              fallbackImage={game.background_image}
            />
          </section>

          {/* About */}
          <section>
            <h2 className='mb-3 text-xl font-bold'>About This Game</h2>
            <p className='text-sm leading-relaxed text-muted-foreground max-w-prose'>
              {game.description_raw ?? "No description available."}
            </p>
            {game.tags?.length > 0 && (
              <div className='mt-4 flex flex-wrap gap-2'>
                {game.tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag.id}
                    className='rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground'
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Similar Games */}
          {similarGames.length > 0 && (
            <section>
              <h2 className='mb-4 text-xl font-bold'>Similar Games</h2>
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'>
                {similarGames.map((g) => (
                  <Link
                    key={g.id}
                    href={`/games/${g.id}`}
                    className='group cursor-pointer'
                  >
                    <div className='mb-2 aspect-[3/4] overflow-hidden rounded-xs border border-border'>
                      {g.background_image ? (
                        <Image
                          src={g.background_image}
                          alt={g.name}
                          width={300}
                          height={400}
                          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground'>
                          No image
                        </div>
                      )}
                    </div>
                    <p className='text-sm font-medium truncate'>{g.name}</p>
                    <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                      <span className='text-primary'>★</span>{" "}
                      {g.rating.toFixed(1)} ·{" "}
                      {g.genres
                        ?.slice(0, 2)
                        .map((x) => x.name)
                        .join(", ")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar column */}
        <div className='flex flex-col gap-6'>
          {/* Ratings */}
          <Card className='rounded-xs border-border bg-card'>
            <CardContent className='p-5'>
              <p className='mb-2 text-sm text-muted-foreground'>
                {game.ratings_count?.toLocaleString() ?? 0} RATINGS
              </p>
              <div className='mb-4 flex items-center gap-3'>
                <span
                  className={`text-3xl font-bold ${getRatingColor(game.rating)}`}
                >
                  {ratingOutOf10}
                </span>
                <span className='text-lg text-primary'>
                  <StarRating rating={game.rating} />
                </span>
              </div>

              <div className='flex flex-col gap-2'>
                {[5, 4, 3, 2, 1].map((star) => {
                  const ratingEntry = game.ratings?.find(
                    (r) => r.id === star,
                  );
                  const pct = game.ratings_count
                    ? Math.round(
                        ((ratingEntry?.count ?? 0) / game.ratings_count) * 100,
                      )
                    : 0;
                  const barColors: Record<number, string> = {
                    5: "bg-primary",
                    4: "bg-yellow-400",
                    3: "bg-orange-400",
                    2: "bg-red-400",
                    1: "bg-red-600",
                  };
                  return (
                    <RatingBar
                      key={star}
                      label={star}
                      pct={pct}
                      barClass={barColors[star]}
                    />
                  );
                })}
              </div>

              <Button
                variant='outline'
                className='mt-4 w-full cursor-pointer'
              >
                Read All Reviews
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className='rounded-xs border-border bg-card text-sm'>
            <CardContent className='p-5'>
              <h3 className='mb-3 text-base font-bold'>Game Details</h3>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Release Date</span>
                <span className='font-medium text-right'>
                  {game.released ?? "TBD"}
                </span>
              </div>
              {game.developers?.length > 0 && (
                <div className='flex justify-between border-b border-border py-2'>
                  <span className='text-muted-foreground'>Developer</span>
                  <span className='font-medium text-right'>
                    {game.developers.map((d) => d.name).join(", ")}
                  </span>
                </div>
              )}
              {game.publishers?.length > 0 && (
                <div className='flex justify-between border-b border-border py-2'>
                  <span className='text-muted-foreground'>Publisher</span>
                  <span className='font-medium text-right'>
                    {game.publishers.map((d) => d.name).join(", ")}
                  </span>
                </div>
              )}
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Genre</span>
                <span className='font-medium text-right'>
                  {game.genres?.map((g) => g.name).join(", ") ?? "N/A"}
                </span>
              </div>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Platform</span>
                <span className='font-medium text-right'>
                  {game.platforms
                    ?.map((p) => p.platform.name)
                    .slice(0, 3)
                    .join(", ") ?? "N/A"}
                  {game.platforms?.length > 3 ? " + more" : ""}
                </span>
              </div>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Game Mode</span>
                <span className='font-medium'>Single Player</span>
              </div>
              <div className='flex justify-between py-2'>
                <span className='text-muted-foreground'>ESRB</span>
                <span className='font-medium'>
                  {game.esrb_rating?.name ?? "Not Rated"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer spacing */}
      <div className='h-12' />
    </div>
  );
}
