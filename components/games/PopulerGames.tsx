import { GameRow } from "@/components/games/GameRow";
import { getGames } from "@/lib/rawg";

export async function PopularGames() {
  const { results } = await getGames({ ordering: "-added", page_size: 12 });

  return (
    <GameRow
      title='Popular Games'
      viewAllHref='/explore?sort=popular'
      games={results}
    />
  );
}
