import { GenreGrid } from "@/components/games/GenreGrid";
import { PopularGames } from "@/components/games/PopulerGames";
import { TopRatedGames } from "@/components/games/TopRatedGames";
import { UpcomingGames } from "@/components/games/UpcomingGames";
import { CustomGameRow } from "@/components/games/CustomGameRow";
import HeroSlider from "@/components/slider/Heroslider";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <PopularGames />
      <GenreGrid />
      <UpcomingGames />
      <TopRatedGames />
      <CustomGameRow />
    </div>
  );
}
