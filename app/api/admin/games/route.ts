import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [reviewedIds, favoritedIds] = await Promise.all([
      Review.aggregate([
        { $group: { _id: "$gameId", name: { $first: "$gameName" }, image: { $first: "$gameImage" }, reviewCount: { $sum: 1 } } },
        { $sort: { reviewCount: -1 } },
      ]),
      Favorite.aggregate([
        { $group: { _id: "$gameId", name: { $first: "$gameName" }, image: { $first: "$gameImage" }, favoriteCount: { $sum: 1 } } },
        { $sort: { favoriteCount: -1 } },
      ]),
    ]);

    const gameMap = new Map<string, { name: string; image?: string; reviewCount: number; favoriteCount: number }>();

    for (const r of reviewedIds) {
      gameMap.set(String(r._id), {
        name: r.name,
        image: r.image,
        reviewCount: r.reviewCount,
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
          image: f.image,
          reviewCount: 0,
          favoriteCount: f.favoriteCount,
        });
      }
    }

    const games = Array.from(gameMap.entries())
      .map(([id, data]) => ({
        gameId: Number(id),
        ...data,
        total: data.reviewCount + data.favoriteCount,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Admin games list error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
