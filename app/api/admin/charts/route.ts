import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import CustomGame from "@/models/CustomGame";

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

function formatLabel(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const now = new Date();
    const labels: string[] = [];
    const monthKeys: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(formatLabel(d.getFullYear(), d.getMonth() + 1));
      monthKeys.push(getMonthKey(d));
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

    const getDataForLabels = (map: Record<string, number>): number[] => {
      return monthKeys.map((key) => map[key] ?? 0);
    };

    const [userGroups, reviewGroups, customGameGroups] = await Promise.all([
      User.aggregate([
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Review.aggregate([
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      CustomGame.aggregate([
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const userMap = toCumulativeMap(userGroups);
    const reviewMap = toCumulativeMap(reviewGroups);
    const customGameMap = toCumulativeMap(customGameGroups);

    return NextResponse.json({
      labels,
      users: getDataForLabels(userMap),
      games: getDataForLabels(customGameMap),
      reviews: getDataForLabels(reviewMap),
      news: monthKeys.map(() => 0),
    });
  } catch (error) {
    console.error("Admin charts error:", error);
    return NextResponse.json({ labels: [], users: [], games: [], reviews: [], news: [] }, { status: 500 });
  }
}
