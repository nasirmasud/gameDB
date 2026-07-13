import { getGenres } from "@/lib/rawg";
import { GenresContent } from "@/components/genres/GenresContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genres",
  description: "Explore games by genre.",
};

export default async function GenresPage() {
  const { results } = await getGenres();

  const totalGames = results.reduce((sum, g) => sum + g.games_count, 0);

  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-8 flex flex-wrap items-start justify-between gap-2'>
        <div>
          <h1 className='mb-1 text-2xl font-bold text-foreground sm:text-3xl'>
            All Genres
          </h1>
          <p className='text-sm text-muted-foreground'>
            Explore games by your favorite genres.
          </p>
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>
          {totalGames.toLocaleString()} games across {results.length} genres
        </p>
      </div>

      <GenresContent genres={results} />
    </div>
  );
}
