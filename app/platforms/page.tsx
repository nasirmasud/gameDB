import { getGames, getPlatforms } from "@/lib/rawg";
import { PlatformsContent } from "@/components/platforms/PlatformsContent";

export default async function PlatformsPage() {
  const { results: platforms } = await getPlatforms();

  const topGames = await Promise.all(
    platforms.map((p) =>
      getGames({ platforms: p.id.toString(), ordering: "-rating", page_size: 1 })
        .then((res) => ({
          platformId: p.id,
          game: res.results[0] ?? null,
        }))
        .catch(() => ({ platformId: p.id, game: null })),
    ),
  );

  const topGamesMap = new Map(topGames.map((tg) => [tg.platformId, tg.game]));

  const platformsWithTopGames = platforms.map((p) => ({
    ...p,
    topGame: topGamesMap.get(p.id) ?? null,
  }));

  const totalGames = platforms.reduce((sum, p) => sum + p.games_count, 0);

  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-10 border-b border-border pb-6'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
              {platforms.length} platforms
            </div>
            <h1 className='text-3xl font-bold text-foreground sm:text-4xl'>
              All Platforms
            </h1>
            <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>
              Every platform, every world — find the games that define your
              favorite ecosystem.
            </p>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span className='font-semibold text-foreground'>
              {totalGames.toLocaleString()}
            </span>
            <span>games available</span>
          </div>
        </div>
      </div>

      <PlatformsContent platforms={platformsWithTopGames} />
    </div>
  );
}
