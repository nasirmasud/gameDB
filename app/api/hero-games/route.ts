import { getGames } from "@/lib/rawg";
import { NextResponse } from "next/server";

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
    description: "",
    platformSlugs: normalizePlatformSlugs(game.platforms),
  };
}

function getBaseTitle(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(
      /\b(goty|game of the year|complete|definitive|remastered|edition|royal|deluxe|enhanced)\b/gi,
      "",
    )
    .replace(/[:\-–—]/g, " ") // colon/hyphen/dash-কে স্পেসে বদলাও, split না করে
    .replace(/[^a-z0-9 ]/g, "") // বাকি বিশেষ চিহ্ন (apostrophe ইত্যাদি) বাদ
    .replace(/\s+/g, " ")
    .trim();

  // প্রথম ৩টা শব্দকেই "মূল গেম"-এর পরিচয় ধরা হচ্ছে
  return cleaned.split(" ").slice(0, 3).join(" ");
}

function dedupeByBaseTitle<T extends { name: string }>(games: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const game of games) {
    const base = getBaseTitle(game.name);
    if (seen.has(base)) continue;
    seen.add(base);
    unique.push(game);
  }

  return unique;
}

export async function GET() {
  try {
    // বেশি candidate আনি (৪০টা) যাতে filter + dedupe করার পরও যথেষ্ট গেম বাঁচে
    const gamesResponse = await getGames({
      page_size: 40,
      ordering: "-rating",
    });
    const candidates = gamesResponse.results ?? [];

    // অন্তত 3০০ জন রেট করেছে এমন গেমই নেয়া হবে — নাহলে low-sample obscure game ঢুকে যায়
    const MIN_RATINGS_COUNT = 300;
    const trustworthy = candidates.filter(
      (game) => (game.ratings_count ?? 0) >= MIN_RATINGS_COUNT,
    );

    // filter-এর পর যথেষ্ট গেম না থাকলে (rare edge case) unfiltered pool-এ fallback করো
    const pool = trustworthy.length >= 5 ? trustworthy : candidates;

    const sorted = [...pool].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    // একই গেমের একাধিক edition/DLC থাকলে প্রথমটাই (সবচেয়ে বেশি rated) রাখো
    const deduped = dedupeByBaseTitle(sorted);

    const topGames = deduped.slice(0, 5);

    return NextResponse.json({ results: topGames.map(mapHeroGame) });
  } catch (error) {
    console.error("Failed to load hero games", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
