import { GameRow } from "@/components/games/GameRow";
import { getUpcomingGames } from "@/lib/rawg";

export async function UpcomingGames() {
  const { results } = await getUpcomingGames(12);

  return (
    <GameRow
      title='Upcoming Releases'
      viewAllHref='/explore?sort=-released'
      games={results}
    />
  );
}
