import { GameRow } from "@/components/games/GameRow";
import { getGames, getUpcomingGames } from "@/lib/rawg";

export async function UpcomingGames() {
  const [upcoming, gtaSearch] = await Promise.all([
    getUpcomingGames(11),
    getGames({ search: "Grand Theft Auto VI", page_size: 1 }).catch(
      () => ({ results: [] }),
    ),
  ]);

  let results = upcoming.results;

  const gtaVI = gtaSearch.results.find(
    (g) =>
      g.name.toLowerCase().includes("gta vi") ||
      g.name.toLowerCase().includes("grand theft auto vi"),
  );

  if (gtaVI && !results.some((g) => g.id === gtaVI.id)) {
    results = [gtaVI, ...results];
  }

  return (
    <GameRow
      title='Upcoming Releases'
      viewAllHref='/explore?sort=-released'
      games={results}
    />
  );
}
