import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import CustomGame from "@/models/CustomGame";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const [totalUsers, totalReviews, totalCustomGames] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      CustomGame.countDocuments(),
    ]);

    const [reviewedGames, favoritedGames] = await Promise.all([
      Review.distinct("gameId"),
      Favorite.distinct("gameId"),
    ]);
    const uniqueGameIds = new Set([...reviewedGames, ...favoritedGames]);
    const totalGames = uniqueGameIds.size;

    const usersByRoleRaw = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const usersByRole = usersByRoleRaw.map((r) => ({
      name: r._id === "admin" ? "Admins" : "Users",
      value: r.count,
      percentage: ((r.count / totalUsers) * 100).toFixed(1),
      color: r._id === "admin" ? "#a855f7" : "#22c55e",
    }));

    const gamesByStatusRaw =
      totalCustomGames > 0
        ? await CustomGame.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ])
        : [];

    const statusColors: Record<string, string> = {
      published: "#22c55e",
      draft: "#a855f7",
      pending: "#eab308",
      archived: "#ef4444",
    };
    const gamesByStatus = gamesByStatusRaw.map((r) => ({
      name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
      value: r.count,
      percentage: totalCustomGames > 0 ? ((r.count / totalCustomGames) * 100).toFixed(1) : "0",
      color: statusColors[r._id] || "#6b7280",
    }));

    return NextResponse.json({
      totalUsers,
      totalGames,
      totalReviews,
      totalRatings: totalReviews,
      totalNews: 0,
      usersByRole,
      gamesByStatus,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
