// import { getGames } from "@/lib/rawg";
// import { Star } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";

// function getBaseTitle(name: string): string {
//   const cleaned = name
//     .toLowerCase()
//     .replace(
//       /\b(goty|game of the year|complete|definitive|remastered|edition|royal|deluxe|enhanced)\b/gi,
//       "",
//     )
//     .replace(/[:\-–—]/g, " ")
//     .replace(/[^a-z0-9 ]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();

//   return cleaned.split(" ").slice(0, 3).join(" ");
// }

// function dedupeByBaseTitle<T extends { name: string }>(games: T[]): T[] {
//   const seen = new Set<string>();
//   const unique: T[] = [];
//   for (const game of games) {
//     const base = getBaseTitle(game.name);
//     if (seen.has(base)) continue;
//     seen.add(base);
//     unique.push(game);
//   }
//   return unique;
// }

// function chunk<T>(arr: T[], size: number): T[][] {
//   const result: T[][] = [];
//   for (let i = 0; i < arr.length; i += size) {
//     result.push(arr.slice(i, i + size));
//   }
//   return result;
// }

// export async function TopRatedGames() {
//   const { results } = await getGames({ ordering: "-rating", page_size: 40 });

//   const MIN_RATINGS_COUNT = 500;
//   const trustworthy = results.filter(
//     (g) => (g.ratings_count ?? 0) >= MIN_RATINGS_COUNT,
//   );
//   const pool = trustworthy.length >= 9 ? trustworthy : results;

//   const sorted = [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
//   const deduped = dedupeByBaseTitle(sorted).slice(0, 9);

//   const columns = chunk(deduped, 3);

//   return (
//     <section className='w-full px-8 py-8 md:px-12 lg:px-16'>
//       <div className='mb-4 flex items-center justify-between'>
//         <h2 className='text-xl font-bold text-foreground'>Top Rated Games</h2>
//         <Link
//           href='/explore?ordering=-rating'
//           className='text-sm font-medium text-primary hover:underline'
//         >
//           View All →
//         </Link>
//       </div>

//       <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
//         {columns.map((column, colIndex) => (
//           <div key={colIndex} className='flex flex-col gap-3'>
//             {column.map((game, rowIndex) => {
//               const rank = colIndex * 3 + rowIndex + 1;
//               const year = game.released
//                 ? new Date(game.released).getFullYear()
//                 : "—";
//               const ratingOutOf10 = (game.rating * 2).toFixed(1);

//               return (
//                 <Link
//                   key={game.id}
//                   href={`/games/${game.id}`}
//                   className='flex h-16 items-center gap-3 rounded-xs border border-border bg-card px-3 transition-colors hover:bg-secondary'
//                 >
//                   <span className='w-5 shrink-0 text-center text-base font-bold text-muted-foreground'>
//                     {rank}
//                   </span>

//                   {game.background_image ? (
//                     <Image
//                       src={game.background_image}
//                       alt={game.name}
//                       width={64}
//                       height={64}
//                       className='h-16 w-16 shrink-0 object-cover'
//                     />
//                   ) : (
//                     <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-secondary text-[8px] text-muted-foreground'>
//                       No image
//                     </div>
//                   )}

//                   <div className='flex min-w-0 flex-1 flex-col justify-center'>
//                     <h3 className='truncate text-sm font-semibold leading-tight text-foreground hover:underline'>
//                       {game.name}
//                     </h3>
//                     <span className='flex items-center gap-1 text-xs font-semibold text-primary'>
//                       <Star className='h-3 w-3 fill-current' />
//                       {ratingOutOf10}
//                     </span>
//                   </div>

//                   <span className='shrink-0 text-xs text-muted-foreground'>
//                     {year}
//                   </span>
//                 </Link>
//               );
//             })}
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import { getGames } from "@/lib/rawg";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function getBaseTitle(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(
      /\b(goty|game of the year|complete|definitive|remastered|edition|royal|deluxe|enhanced)\b/gi,
      "",
    )
    .replace(/[:\-–—]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.split(" ").slice(0, 3).join(" ");
}

function dedupeByBaseTitle<T extends { name: string }>(games: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const game of games) {
    const base = getBaseTitle(game.name);
    if (seen.has(base)) continue;
    seen.add(base);
    unique.push(game);
  }
  return unique;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function TopRatedGames() {
  const { results } = await getGames({ ordering: "-rating", page_size: 100 });

  const MIN_RATINGS_COUNT = 500;
  const trustworthy = results.filter(
    (g) => (g.ratings_count ?? 0) >= MIN_RATINGS_COUNT,
  );
  const pool = trustworthy.length >= 12 ? trustworthy : results;

  const sorted = [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const deduped = dedupeByBaseTitle(sorted).slice(0, 12);

  const columns = chunk(deduped, 3);

  return (
    <section className='w-full px-8 py-20 md:px-12 lg:px-16'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-bold text-foreground'>Top Rated Games</h2>
        <Link
          href='/explore?ordering=-rating'
          className='text-sm font-medium text-primary hover:underline'
        >
          View All →
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        {columns.map((column, colIndex) => (
          <div key={colIndex} className='flex flex-col gap-4'>
            {column.map((game, rowIndex) => {
              const rank = colIndex * 3 + rowIndex + 1;
              const year = game.released
                ? new Date(game.released).getFullYear()
                : null;
              const ratingOutOf10 = (game.rating * 2).toFixed(1);

              return (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className='flex h-16 items-center gap-3 rounded-xs border border-border bg-card px-3 transition-colors hover:bg-secondary'
                >
                  <span className='w-5 shrink-0 text-center text-base font-bold text-muted-foreground'>
                    {rank}
                  </span>

                  {game.background_image ? (
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      width={64}
                      height={64}
                      className='h-16 w-16 shrink-0 object-cover'
                    />
                  ) : (
                    <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-secondary text-[8px] text-muted-foreground'>
                      No image
                    </div>
                  )}

                  <div className='flex min-w-0 flex-1 flex-col justify-center'>
                    <h3 className='truncate text-sm font-semibold leading-tight text-foreground hover:underline'>
                      {game.name}
                    </h3>
                    <span className='flex items-center gap-1 text-xs font-semibold text-primary'>
                      <Star className='h-3 w-3 fill-current' />
                      {ratingOutOf10}
                    </span>
                  </div>

                  {year && (
                    <span className='shrink-0 text-xs text-muted-foreground'>
                      {year}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
