import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getGameById } from "@/lib/rawg";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import Link from "next/link";
import { GameImage } from "@/components/admin/GameImage";
import { ArrowLeft, Star, MessageSquare, BookmarkCheck } from "lucide-react";

export default async function AdminGamesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const [reviewedIds, favoritedIds] = await Promise.all([
    Review.aggregate([
      {
        $group: {
          _id: "$gameId",
          name: { $first: "$gameName" },
          reviewCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { reviewCount: -1 } },
    ]),
    Favorite.aggregate([
      {
        $group: {
          _id: "$gameId",
          name: { $first: "$gameName" },
          favoriteCount: { $sum: 1 },
        },
      },
      { $sort: { favoriteCount: -1 } },
    ]),
  ]);

  const gameMap = new Map<
    string,
    { name: string; reviewCount: number; avgRating: number; favoriteCount: number }
  >();

  for (const r of reviewedIds) {
    gameMap.set(String(r._id), {
      name: r.name,
      reviewCount: r.reviewCount,
      avgRating: Math.round(r.avgRating * 10) / 10,
      favoriteCount: 0,
    });
  }

  for (const f of favoritedIds) {
    const existing = gameMap.get(String(f._id));
    if (existing) {
      existing.favoriteCount = f.favoriteCount;
    } else {
      gameMap.set(String(f._id), {
        name: f.name,
        reviewCount: 0,
        avgRating: 0,
        favoriteCount: f.favoriteCount,
      });
    }
  }

  const games = Array.from(gameMap.entries())
    .map(([id, data]) => ({
      gameId: Number(id),
      ...data,
      total: data.reviewCount + data.favoriteCount,
      image: null as string | null,
    }))
    .sort((a, b) => b.total - a.total);

  await Promise.all(
    games.map(async (g) => {
      try {
        const detail = await getGameById(g.gameId);
        g.image = detail.background_image ?? null;
      } catch {
        g.image = null;
      }
    }),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">All Games</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {games.length} games with activity on the platform.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Game</th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Reviews</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Avg Rating</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><BookmarkCheck className="h-3.5 w-3.5" /> Favorites</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">Total Activity</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <tr key={g.gameId} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <Link href={`/games/${g.gameId}`} className="flex items-center gap-3 hover:text-primary">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                      <GameImage src={g.image} alt={g.name} />
                    </div>
                    <span className="font-medium">{g.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">{g.reviewCount}</td>
                <td className="px-4 py-3 text-center">
                  {g.avgRating > 0 ? (
                    <span className="inline-flex items-center gap-1 text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" /> {g.avgRating}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{g.favoriteCount}</td>
                <td className="px-4 py-3 text-center font-medium">{g.total}</td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No games with activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
