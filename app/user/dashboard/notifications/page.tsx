import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Favorite from "@/models/Favorite";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

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

export default async function UserNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectDB();
  const userId = session.user.id;

  const [reviews, wishlistItems] = await Promise.all([
    Review.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean(),
    Favorite.find({ user: userId }).sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const notifications: Array<{
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    time: string;
    read: boolean;
  }> = [];

  for (const r of reviews) {
    const label =
      r.status === "approved"
        ? "Review approved"
        : r.status === "rejected"
          ? "Review rejected"
          : "Review pending";
    notifications.push({
      id: `review-${r._id}`,
      icon: r.status === "approved" ? "check" : r.status === "rejected" ? "x" : "clock",
      title: label,
      subtitle: r.gameName,
      time: timeAgo(r.createdAt),
      read: r.status === "approved" || r.status === "rejected",
    });
  }

  for (const b of wishlistItems) {
    notifications.push({
      id: `wishlist-${b._id}`,
      icon: "wishlist",
      title: "Game wishlisted",
      subtitle: b.gameName,
      time: timeAgo(b.createdAt),
      read: true,
    });
  }

  notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="pt-20 pb-40 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <Bell className="h-6 w-6" /> Notifications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {notifications.length} notifications
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <NotificationsList notifications={notifications} />
      </div>
    </div>
  );
}
