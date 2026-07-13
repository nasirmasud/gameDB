import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScreenshotGallery } from "@/components/games/ScreenshotGallery";
import type { MediaItem } from "@/lib/rawg";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/auth";
import CustomGame from "@/models/CustomGame";
import { CustomGameEditButton } from "@/components/games/CustomGameEditButton";
import { PlatformIconsWrapper } from "@/components/games/PlatformIconsWrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  await connectDB();
  const game = await CustomGame.findById(id).lean();

  if (!game) return { title: "Custom Game - GameDB" };

  return {
    title: `${game.title} - GameDB`,
    description: game.shortDescription,
  };
}

export default async function CustomGameDetailPage({ params }: Props) {
  const { id } = await params;

  await connectDB();
  const game = await CustomGame.findById(id).lean();

  if (!game) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id && game.submittedBy.toString() === session.user.id;
  const isAdmin = session?.user?.role === "admin";
  const canEdit = isOwner || isAdmin;

  const images = game.screenshots ?? [];

  const mediaItems: MediaItem[] = images.map((url: string, i: number) => ({
    type: "screenshot" as const,
    id: i,
    image: url,
  }));

  const platformData = (game.platforms ?? []).map((name: string, i: number) => ({
    platform: { id: i, name, slug: name.toLowerCase() },
  }));

  const platformNames = game.platforms ?? [];

  const similarGames = await CustomGame.aggregate([
    { $match: { _id: { $ne: game._id }, status: "published" } },
    {
      $addFields: {
        genreMatch: { $cond: [{ $eq: ["$genre", game.genre] }, 0, 1] },
      },
    },
    { $sort: { genreMatch: 1, createdAt: -1 } },
    { $limit: 5 },
  ]);

  return (
    <div className='w-full px-4 py-6 sm:px-6 lg:px-12 xl:px-20 2xl:px-28'>
      {/* Breadcrumb */}
      <nav className='mb-6 flex items-center gap-2 text-sm text-muted-foreground max-w-screen-2xl mx-auto'>
        <Link href='/' className='hover:text-foreground transition-colors'>Home</Link>
        <span>›</span>
        <Link href='/explore' className='hover:text-foreground transition-colors'>Games</Link>
        <span>›</span>
        <span className='text-foreground truncate max-w-[200px]'>{game.title}</span>
      </nav>

      {/* Hero section */}
      <div className='relative overflow-hidden rounded-xs border border-border mb-6'>
        <div className='absolute inset-0'>
          {game.imageUrl ? (
            <Image src={game.imageUrl} alt='' fill className='object-cover' priority />
          ) : null}
          <div className='absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40' />
        </div>

        <div className='relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-8 lg:p-12 lg:grid-cols-[280px_1fr_280px]'>
          {/* Cover */}
          <div className='overflow-hidden rounded-xs border border-border shadow-2xl h-[360px] lg:h-[420px]'>
            {game.imageUrl ? (
              <Image src={game.imageUrl} alt={game.title} width={280} height={420} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-secondary text-muted-foreground text-sm'>No image</div>
            )}
          </div>

          {/* Main info */}
          <div className='flex flex-col justify-center gap-4 lg:justify-start lg:pt-8'>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className='text-4xl font-bold lg:text-5xl'>{game.title}</h1>
              {canEdit && (
                <CustomGameEditButton
                  game={{
                    _id: game._id.toString(),
                    title: game.title,
                    shortDescription: game.shortDescription,
                    fullDescription: game.fullDescription,
                    releaseDate: game.releaseDate.toISOString(),
                    genre: game.genre,
                    developer: game.developer ?? null,
                    publisher: game.publisher ?? null,
                    platforms: game.platforms ?? [],
                    screenshots: game.screenshots ?? [],
                    tags: game.tags ?? [],
                    imageUrl: game.imageUrl ?? null,
                  }}
                />
              )}
            </div>

            <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
              <span>{game.genre}</span>
              <span>•</span>
              <span>
                {new Date(game.releaseDate).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>

            <PlatformIconsWrapper platforms={platformData} />
            {platformNames.length > 0 && (
              <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
                {platformNames.join(", ")}
              </div>
            )}

            <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
              {game.shortDescription}
            </p>

            <div className='flex flex-wrap gap-x-6 gap-y-3 pt-2'>
              {game.developer && (
                <div>
                  <p className='text-xs text-muted-foreground'>Developer</p>
                  <p className='text-sm font-medium'>{game.developer}</p>
                </div>
              )}
              {game.publisher && (
                <div>
                  <p className='text-xs text-muted-foreground'>Publisher</p>
                  <p className='text-sm font-medium'>{game.publisher}</p>
                </div>
              )}
              <div>
                <p className='text-xs text-muted-foreground'>Release Date</p>
                <p className='text-sm font-medium'>
                  {new Date(game.releaseDate).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Purchase card */}
          <Card className='rounded-xs h-fit border-border bg-card/90 backdrop-blur-sm lg:self-center'>
            <CardContent className='p-6'>
              <p className='mb-4 text-3xl font-bold'>Free</p>
              <Button className='w-full mb-3 cursor-pointer text-base py-5'>Buy Now</Button>
              <Button variant='outline' size='lg' className='w-full mb-5 flex items-center justify-center gap-2 cursor-pointer'>
                <Star className='h-4 w-4' /> Add to Wishlist
              </Button>

              <ul className='flex flex-col gap-3 text-sm'>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>Offline Play</span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>Single Player</span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>Cloud Save</span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>Controller Support</span>
                  <span className='text-primary'>✓</span>
                </li>
                <li className='flex items-center justify-between'>
                  <span className='flex items-center gap-2 text-muted-foreground'>Achievements</span>
                  <span className='text-primary'>✓</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content sections */}
      <div className='max-w-screen-2xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]'>
        {/* Main column */}
        <div className='flex flex-col gap-8 min-w-0'>
          {/* Gallery */}
          <section>
            <h2 className='mb-4 text-xl font-bold'>Media</h2>
            <ScreenshotGallery items={mediaItems} gameName={game.title} fallbackImage={game.imageUrl} />
          </section>

          {/* About */}
          <section>
            <h2 className='mb-3 text-xl font-bold'>About This Game</h2>
            <p className='text-sm leading-relaxed text-muted-foreground max-w-prose'>
              {game.fullDescription}
            </p>
            {game.tags && game.tags.length > 0 && (
              <div className='mt-4 flex flex-wrap gap-2'>
                {game.tags.map((tag: string) => (
                  <span key={tag} className='rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground'>
                    {tag}
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
                  <Link key={g._id.toString()} href={`/games/custom/${g._id}`} className='group cursor-pointer'>
                    <div className='mb-2 aspect-[3/4] overflow-hidden rounded-xs border border-border'>
                      {g.imageUrl ? (
                        <Image src={g.imageUrl} alt={g.title} width={300} height={400} className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105' />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground'>No image</div>
                      )}
                    </div>
                    <p className='text-sm font-medium truncate'>{g.title}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>{g.genre}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar column */}
        <div className='flex flex-col gap-6'>
          {/* Details */}
          <Card className='rounded-xs border-border bg-card text-sm'>
            <CardContent className='p-5'>
              <h3 className='mb-3 text-base font-bold'>Game Details</h3>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Release Date</span>
                <span className='font-medium text-right'>
                  {new Date(game.releaseDate).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
              {game.developer && (
                <div className='flex justify-between border-b border-border py-2'>
                  <span className='text-muted-foreground'>Developer</span>
                  <span className='font-medium text-right'>{game.developer}</span>
                </div>
              )}
              {game.publisher && (
                <div className='flex justify-between border-b border-border py-2'>
                  <span className='text-muted-foreground'>Publisher</span>
                  <span className='font-medium text-right'>{game.publisher}</span>
                </div>
              )}
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Genre</span>
                <span className='font-medium text-right'>{game.genre}</span>
              </div>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Platform</span>
                <span className='font-medium text-right'>
                  {platformData.map((p: { platform: { name: string } }) => p.platform.name).slice(0, 3).join(", ") ?? "N/A"}
                  {platformData.length > 3 ? " + more" : ""}
                </span>
              </div>
              <div className='flex justify-between border-b border-border py-2'>
                <span className='text-muted-foreground'>Game Mode</span>
                <span className='font-medium'>Single Player</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='h-12' />
    </div>
  );
}
