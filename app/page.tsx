import { GenreGrid } from "@/components/games/GenreGrid";
import { PopularGames } from "@/components/games/PopulerGames";
import HeroSlider from "@/components/slider/Heroslider";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <PopularGames />
      <GenreGrid />
    </div>
  );
}
