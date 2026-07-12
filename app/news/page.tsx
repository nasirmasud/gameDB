import { getGames } from "@/lib/rawg";
import { NewsContent } from "@/components/news/NewsContent";

export default async function NewsPage() {
  const today = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const from = ninetyDaysAgo.toISOString().split("T")[0];
  const to = today.toISOString().split("T")[0];

  const { results } = await getGames({
    dates: `${from},${to}`,
    ordering: "-released",
    page_size: 15,
  });

  return (
    <div className='w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-16'>
      <div className='mb-6'>
        <h1 className='mb-1 text-2xl font-bold text-foreground sm:text-3xl'>
          News
        </h1>
        <p className='text-sm text-muted-foreground'>
          Your source for the latest in gaming.
        </p>
      </div>

      <NewsContent games={results} />
    </div>
  );
}
