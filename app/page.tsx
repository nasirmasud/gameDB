import { PopularGames } from "@/components/games/PopulerGames";
import HeroSlider from "@/components/slider/Heroslider";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <PopularGames />
    </div>
  );
}
