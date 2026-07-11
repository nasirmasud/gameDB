const RAWG_BASE_URL = "https://api.rawg.io/api";
const RAWG_API_KEY = process.env.RAWG_API_KEY;

if (!RAWG_API_KEY) {
  throw new Error("Please define the RAWG_API_KEY environment variable in .env.local");
}

// ---------- Types (only the fields we actually use) ----------

export interface RawgGameSummary {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  rating_top: number;
  ratings_count: number;
  metacritic: number | null;
  playtime: number;
  genres: { id: number; name: string; slug: string }[];
  platforms: { platform: { id: number; name: string; slug: string } }[];
  short_screenshots?: { id: number; image: string }[];
}

export interface RawgRating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface RawgGameDetail extends RawgGameSummary {
  description_raw: string;
  website: string;
  esrb_rating: { id: number; name: string } | null;
  developers: { id: number; name: string }[];
  publishers: { id: number; name: string }[];
  tags: { id: number; name: string }[];
  ratings: RawgRating[];
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GameListParams {
  page?: number;
  page_size?: number;
  search?: string;
  genres?: string; // comma separated genre slugs, e.g. "action,rpg"
  platforms?: string; // comma separated platform ids
  ordering?: string; // e.g. "-rating", "-released", "name"
  dates?: string; // "2020-01-01,2020-12-31"
}

// ---------- Internal fetch helper ----------

async function rawgFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.set("key", RAWG_API_KEY as string);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    // Cache list/detail data for an hour — RAWG data doesn't change minute-to-minute,
    // and this keeps us well under RAWG's rate limit.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`RAWG API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ---------- Public functions ----------

export function getGames(params: GameListParams = {}) {
  return rawgFetch<RawgListResponse<RawgGameSummary>>("/games", {
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    search: params.search,
    genres: params.genres,
    platforms: params.platforms,
    ordering: params.ordering,
    dates: params.dates,
  });
}

export function getGameById(id: number | string) {
  return rawgFetch<RawgGameDetail>(`/games/${id}`);
}

export function getGameScreenshots(id: number | string) {
  return rawgFetch<RawgListResponse<{ id: number; image: string }>>(`/games/${id}/screenshots`);
}

export interface RawgMovieData {
  max: string;
}

export interface RawgMovie {
  id: number;
  name: string;
  preview: string;
  data: RawgMovieData;
}

export function getGameMovies(id: number | string) {
  return rawgFetch<RawgListResponse<RawgMovie>>(`/games/${id}/movies`);
}

export type MediaItem =
  | { type: "screenshot"; id: number; image: string }
  | { type: "movie"; id: number; preview: string; videoUrl: string; name: string };

export function getGenres() {
  return rawgFetch<RawgListResponse<{ id: number; name: string; slug: string; games_count: number }>>(
    "/genres"
  );
}

export function getPlatforms() {
  return rawgFetch<RawgListResponse<{ id: number; name: string; slug: string; games_count: number }>>(
    "/platforms"
  );
}

// Convenience: games sorted by rating, for "Top Rated" / "Popular" home sections
export function getTopRatedGames(pageSize = 10) {
  return getGames({ ordering: "-rating", page_size: pageSize });
}

// Convenience: upcoming releases (today onwards), for "Upcoming Releases" section
export function getUpcomingGames(pageSize = 10) {
  const today = new Date().toISOString().split("T")[0];
  const oneYearOut = new Date();
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
  const future = oneYearOut.toISOString().split("T")[0];

  return getGames({
    dates: `${today},${future}`,
    ordering: "released",
    page_size: pageSize,
  });
}
