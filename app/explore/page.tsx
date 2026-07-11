import { ExploreFilters } from "@/components/explore/ExploreFilters";
import { ExplorePagination } from "@/components/explore/ExplorePagination";
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

  // RAWG-এ কোটি কোটি রেজাল্ট থাকতে পারে, কিন্তু API নিজেই বেশ কিছু পেজের পরে
  // error দেয় — তাই বাস্তবসম্মত একটা সীমা বসিয়ে দিচ্ছি
  const totalPages = Math.min(Math.ceil(gamesData.count / PAGE_SIZE), 500);

  return (
    <div className='w-full px-8 py-8 md:px-12 lg:px-16'>
      <h1 className='mb-6 text-2xl font-bold text-foreground'>Explore Games</h1>

      <ExploreFilters
        genres={genresData.results}
        platforms={platformsData.results}
      />

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
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
          {gamesData.results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      <ExplorePagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
