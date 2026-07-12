import { ExploreFilters } from "@/components/explore/ExploreFilters";
import { ExplorePagination } from "@/components/explore/ExplorePagination";
import { ExploreToolbar } from "@/components/explore/ExploreToolbar";
import { GameCard } from "@/components/games/GameCard";
import { getGames, getGenres, getPlatforms } from "@/lib/rawg";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PAGE_SIZE = 24;

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : "";
  const genres = typeof params.genres === "string" ? params.genres : "";
  const platforms =
    typeof params.platforms === "string" ? params.platforms : "";
  const ordering =
    typeof params.ordering === "string" ? params.ordering : "-added";
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page) || 1)
      : 1;

  const [gamesData, genresData, platformsData] = await Promise.all([
    getGames({
      search,
      genres,
      platforms,
      ordering,
      page,
      page_size: PAGE_SIZE,
    }),
    getGenres(),
    getPlatforms(),
  ]);

  const totalPages = Math.min(Math.ceil(gamesData.count / PAGE_SIZE), 500);

  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-8 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='mb-1 text-3xl font-bold text-foreground'>
            All Games
          </h1>
          <p className='text-sm text-muted-foreground'>
            {gamesData.count.toLocaleString()} games found
          </p>
        </div>
        <ExploreToolbar />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:gap-8 xl:grid-cols-[260px_1fr]'>
        <ExploreFilters
          genres={genresData.results}
          platforms={platformsData.results}
        />

        <div>
          {gamesData.results.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card py-20 text-center'>
              <p className='text-lg font-semibold text-foreground'>
                No games found
              </p>
              <p className='text-sm text-muted-foreground'>
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
              {gamesData.results.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          <ExplorePagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
