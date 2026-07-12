import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import CustomGame from "@/models/CustomGame";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot ban/unban an admin." }, { status: 403 });
    }

    const { isBanned } = await req.json();
    user.isBanned = !!isBanned;
    await user.save();

    return NextResponse.json({
      message: isBanned ? "User banned." : "User unbanned.",
      isBanned: user.isBanned,
    });
  } catch (error) {
    console.error("Admin ban/unban error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json({ error: "Cannot delete an admin user." }, { status: 403 });
    }

    const [deletedReviews, deletedFavorites, deletedCustomGames] = await Promise.all([
      Review.deleteMany({ user: id }),
      Favorite.deleteMany({ user: id }),
      CustomGame.deleteMany({ submittedBy: id }),
      User.findByIdAndDelete(id),
    ]);

    return NextResponse.json({
      message: "User and all associated data deleted.",
      deletedReviews: deletedReviews.deletedCount,
      deletedFavorites: deletedFavorites.deletedCount,
      deletedCustomGames: deletedCustomGames.deletedCount,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
