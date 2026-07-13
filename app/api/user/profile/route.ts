import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import CustomGame from "@/models/CustomGame";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id).select("name email").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ name: user.name, email: user.email });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { name, currentPassword, newPassword } = await req.json();

    const updateData: Record<string, string> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (currentPassword !== undefined || newPassword !== undefined) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Both current password and new password are required." },
          { status: 400 },
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters." },
          { status: 400 },
        );
      }

      const user = await User.findById(session.user.id).select("password");
      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    await User.findByIdAndUpdate(session.user.id, updateData);

    return NextResponse.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const [deletedReviews, deletedFavorites, deletedCustomGames] = await Promise.all([
      Review.deleteMany({ user: userId }),
      Favorite.deleteMany({ user: userId }),
      CustomGame.deleteMany({ submittedBy: userId }),
      User.findByIdAndDelete(userId),
    ]);

    return NextResponse.json({
      message: "Account deleted successfully.",
      deletedReviews: deletedReviews.deletedCount,
      deletedFavorites: deletedFavorites.deletedCount,
      deletedCustomGames: deletedCustomGames.deletedCount,
    });
  } catch (error) {
    console.error("Profile DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
