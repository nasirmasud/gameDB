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

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = parseInt(searchParams.get("range") ?? "6", 10);
    const months = [3, 6, 12].includes(range) ? range : 6;

    const now = new Date();
    const labels: string[] = [];
    const monthKeys: string[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(formatLabel(d.getFullYear(), d.getMonth() + 1));
      monthKeys.push(getMonthKey(d));
    }

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

    const accumulateTo = (
      items: Array<{ _id: { year: number; month: number }; count: number }>,
    ): number[] => {
      const map: Record<string, number> = {};
      let running = 0;
      for (const item of items) {
        running += item.count;
        map[`${item._id.year}-${item._id.month}`] = running;
      }
      let last = 0;
      return monthKeys.map((k) => {
        const v = k in map ? map[k] : last;
        last = v;
        return v;
      });
    };

    return NextResponse.json({
      labels,
      users: accumulateTo(userGroups),
      games: accumulateTo(customGameGroups),
      reviews: accumulateTo(reviewGroups),
    });
  } catch (error) {
    console.error("Admin charts error:", error);
    return NextResponse.json({ labels: [], users: [], games: [], reviews: [] }, { status: 500 });
  }
}
