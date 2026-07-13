import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import Favorite from "@/models/Favorite";
import Review from "@/models/Review";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;

    const [totalBookmarks, totalReviews] = await Promise.all([
      Favorite.countDocuments({ user: userId }),
      Review.countDocuments({ user: userId }),
    ]);

    const reviewsByStatus = await Review.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusColors: Record<string, string> = {
      approved: "#3b82f6",
      pending: "#eab308",
      rejected: "#ef4444",
    };

    const statusLabels: Record<string, string> = {
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
    };

    const reviewsByStatusFormatted = (
      ["approved", "pending", "rejected"] as const
    ).map((s) => {
      const found = reviewsByStatus.find((r) => r._id === s);
      return {
        name: statusLabels[s],
        value: found?.count ?? 0,
        percentage:
          totalReviews > 0
            ? (((found?.count ?? 0) / totalReviews) * 100).toFixed(1)
            : "0",
        color: statusColors[s],
      };
    });

    const ratingDist = await Review.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const ratingColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
    const ratingDistribution = [1, 2, 3, 4, 5].map((r) => {
      const found = ratingDist.find((d) => d._id === r);
      return {
        rating: r,
        count: found?.count ?? 0,
        color: ratingColors[r - 1],
      };
    });

    return NextResponse.json({
      totalBookmarks,
      totalWishlist: totalBookmarks,
      totalReviews,
      totalRatings: totalReviews,
      reviewsByStatus: reviewsByStatusFormatted,
      ratingDistribution,
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
