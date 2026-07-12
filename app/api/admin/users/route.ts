import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 }).lean();

    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const [reviewCount, favoriteCount] = await Promise.all([
          Review.countDocuments({ user: u._id }),
          Favorite.countDocuments({ user: u._id }),
        ]);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isBanned: u.isBanned,
          createdAt: u.createdAt,
          reviewCount,
          favoriteCount,
        };
      }),
    );

    return NextResponse.json({ users: usersWithCounts });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
