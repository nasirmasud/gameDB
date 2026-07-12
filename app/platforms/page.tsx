import { getPlatforms } from "@/lib/rawg";
import { PlatformsContent } from "@/components/platforms/PlatformsContent";

export default async function PlatformsPage() {
  const { results } = await getPlatforms();

  const totalGames = results.reduce((sum, p) => sum + p.games_count, 0);

  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-8 flex flex-wrap items-start justify-between gap-2'>
        <div>
          <h1 className='mb-1 text-2xl font-bold text-foreground sm:text-3xl'>
            All Platforms
          </h1>
          <p className='text-sm text-muted-foreground'>
            Explore games across all gaming platforms.
          </p>
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>
          {totalGames.toLocaleString()} games across {results.length} platforms
        </p>
      </div>

      <PlatformsContent platforms={results} />
    </div>
  );
}
