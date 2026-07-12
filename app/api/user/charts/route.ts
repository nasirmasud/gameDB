import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";

function formatLabel(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;
    const now = new Date();
    const labels: string[] = [];
    const monthKeys: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(formatLabel(d.getFullYear(), d.getMonth() + 1));
      monthKeys.push(`${d.getFullYear()}-${d.getMonth() + 1}`);
    }

    const toCumulativeMap = (
      items: Array<{ _id: { year: number; month: number }; count: number }>,
    ): Record<string, number> => {
      const map: Record<string, number> = {};
      let running = 0;
      for (const item of items) {
        running += item.count;
        map[`${item._id.year}-${item._id.month}`] = running;
      }
      return map;
    };

    const [reviewGroups, favoriteGroups] = await Promise.all([
      Review.aggregate([
        { $match: { user: userId } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Favorite.aggregate([
        { $match: { user: userId } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const reviewMap = toCumulativeMap(reviewGroups);
    const favoriteMap = toCumulativeMap(favoriteGroups);

    return NextResponse.json({
      labels,
      reviews: monthKeys.map((k) => reviewMap[k] ?? 0),
      ratings: monthKeys.map((k) => reviewMap[k] ?? 0),
      bookmarks: monthKeys.map((k) => favoriteMap[k] ?? 0),
      wishlist: monthKeys.map((k) => favoriteMap[k] ?? 0),
    });
  } catch (error) {
    console.error("User charts error:", error);
    return NextResponse.json(
      { labels: [], reviews: [], ratings: [], bookmarks: [], wishlist: [] },
      { status: 500 },
    );
  }
}
