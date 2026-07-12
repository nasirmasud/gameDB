import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getGameById } from "@/lib/rawg";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import Link from "next/link";
import { AdminGamesTable } from "@/components/admin/AdminGamesTable";
import { ArrowLeft } from "lucide-react";

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

      <AdminGamesTable games={games} />
    </div>
  );
}
