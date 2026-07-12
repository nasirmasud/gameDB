import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const userId = session.user.id;

    const [recentReviews, recentBookmarks] = await Promise.all([
      Review.find({ user: userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Favorite.find({ user: userId }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    const all: Array<{
      icon: string;
      color: string;
      title: string;
      subtitle: string;
      time: string;
      sortKey: number;
    }> = [];

    recentReviews.forEach((r) => {
      const statusLabel =
        r.status === "approved"
          ? "Review approved"
          : r.status === "rejected"
            ? "Review rejected"
            : "Review pending";
      const statusColor =
        r.status === "approved"
          ? "bg-blue-600/30 text-blue-400"
          : r.status === "rejected"
            ? "bg-red-600/30 text-red-400"
            : "bg-yellow-600/30 text-yellow-400";
      all.push({
        icon: "review",
        color: statusColor,
        title: statusLabel,
        subtitle: r.gameName,
        time: timeAgo(r.createdAt),
        sortKey: new Date(r.createdAt).getTime(),
      });
    });

    recentBookmarks.forEach((b) => {
      all.push({
        icon: "bookmark",
        color: "bg-purple-600/30 text-purple-400",
        title: "Game bookmarked",
        subtitle: b.gameName,
        time: timeAgo(b.createdAt),
        sortKey: new Date(b.createdAt).getTime(),
      });
    });

    all.sort((a, b) => b.sortKey - a.sortKey);

    const activities = all.slice(0, 5).map(({ icon, color, title, subtitle, time }) => ({
      icon,
      color,
      title,
      subtitle,
      time,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("User activity error:", error);
    return NextResponse.json({ activities: [] }, { status: 500 });
  }
}
