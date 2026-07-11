import {
  BookOpen,
  Car,
  Castle,
  Cog,
  Compass,
  Crosshair,
  Swords as Fighting,
  Gamepad2,
  Gem,
  Home,
  Joystick,
  Layers,
  LucideIcon,
  Puzzle,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

/**
 * RAWG genre slugs — mapped to a representative icon.
 * Fallback (Gamepad2) covers any genre not explicitly listed.
 */
export function getGenreIcon(slug: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    action: Swords,
    adventure: Compass,
    "role-playing-games-rpg": Sparkles,
    shooter: Crosshair,
    strategy: Castle,
    sports: Trophy,
    racing: Car,
    indie: Gem,
    puzzle: Puzzle,
    arcade: Joystick,
    "massively-multiplayer": Users,
    simulation: Cog,
    fighting: Fighting,
    family: Home,
    "board-games": Layers,
    educational: BookOpen,
    card: Layers,
  };

  return map[slug] ?? Gamepad2;
}
