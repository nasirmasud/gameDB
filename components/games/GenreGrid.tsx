import { getGenreIcon } from "@/lib/genre-icons";
import { getGenres } from "@/lib/rawg";
import Link from "next/link";

export async function GenreGrid() {
  const { results } = await getGenres();

  // Reference design shows 8 — trim so all sections stay visually consistent
  const genres = results.slice(0, 8);

  return (
    <section className='mx-auto w-full px-4 py-20 sm:px-6 lg:px-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-foreground'>Browse by Genre</h2>
        <Link
          href='/genres'
          className='text-sm font-medium text-primary hover:underline'
        >
          View All →
        </Link>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8'>
        {genres.map((genre) => {
          const Icon = getGenreIcon(genre.slug);
          return (
            <Link
              key={genre.id}
              href={`/explore?genres=${genre.slug}`}
              className='group flex flex-col items-center gap-3 rounded-xs border border-border bg-card p-5 text-center transition-colors hover:bg-secondary'
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
    </section>
  );
}
