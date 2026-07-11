import { getGenreIcon } from "@/lib/genre-icons";
import { getGenres } from "@/lib/rawg";
import Link from "next/link";

export default async function GenresPage() {
  const { results } = await getGenres();

  return (
    <div className='w-full px-8 py-8 md:px-12 lg:px-16'>
      <h1 className='mb-6 text-2xl font-bold text-foreground'>
        Browse by Genre
      </h1>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6'>
        {results.map((genre) => {
          const Icon = getGenreIcon(genre.slug);
          return (
            <Link
              key={genre.id}
              href={`/explore?genres=${genre.slug}`}
              className='group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-colors hover:bg-secondary'
            >
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary/10'>
                <Icon className='h-6 w-6' />
              </div>

              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {genre.name}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {genre.games_count.toLocaleString()} Games
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
