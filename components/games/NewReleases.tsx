import { GameRow } from "@/components/games/GameRow";
import { getGames } from "@/lib/rawg";

export async function NewReleases() {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const start = threeMonthsAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];

  const { results } = await getGames({
    dates: `${start},${end}`,
    ordering: "-released",
    page_size: 12,
  });

  if (results.length === 0) return null;

  return (
    <GameRow
      title='New Releases'
      viewAllHref='/explore?sort=-released'
      games={results}
    />
  );
}
