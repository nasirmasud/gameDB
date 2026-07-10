import { getGameById, getGames } from "@/lib/rawg";
import { NextResponse } from "next/server";

function stripHtml(text: string | null | undefined) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, "").trim();
}

function normalizePlatformSlugs(
  platforms: Array<{ platform: { slug?: string | null } }> | undefined,
) {
  const slugs = new Set<string>();

  for (const entry of platforms ?? []) {
    const slug = entry.platform?.slug?.toLowerCase();
    if (!slug) continue;

    if (slug === "pc") {
      slugs.add("pc");
    } else if (slug.includes("playstation")) {
      slugs.add("playstation");
    } else if (slug.includes("xbox")) {
      slugs.add("xbox");
    }
  }

  return Array.from(slugs);
}

function mapHeroGame(game: any) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    background_image: game.background_image ?? null,
    rating: game.rating ?? 0,
    ratings_count: game.ratings_count ?? 0,
    metacritic: game.metacritic ?? null,
    description: stripHtml(game.description_raw).slice(0, 180),
    platformSlugs: normalizePlatformSlugs(game.platforms),
  };
}

export async function GET() {
  try {
    const gamesResponse = await getGames({ page_size: 5, ordering: "-rating" });
    const topGames = gamesResponse.results ?? [];

    const heroGames = await Promise.all(
      topGames.slice(0, 5).map(async (game) => {
        try {
          const detail = await getGameById(game.id);
          return mapHeroGame(detail);
        } catch {
          return mapHeroGame(game);
        }
      }),
    );

    return NextResponse.json({ results: heroGames });
  } catch (error) {
    console.error("Failed to load hero games", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
