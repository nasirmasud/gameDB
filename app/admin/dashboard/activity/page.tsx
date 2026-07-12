import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import User from "@/models/User";
import Link from "next/link";
import { ArrowLeft, MessageSquare, UserPlus, Pencil } from "lucide-react";

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
}

const iconMap: Record<string, typeof MessageSquare> = {
  review: MessageSquare,
  user: UserPlus,
};

const colorMap: Record<string, string> = {
  review: "bg-blue-600/30 text-blue-400",
  user: "bg-green-600/30 text-green-400",
};

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  await connectDB();

  const [reviews, users] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).limit(50).lean(),
    User.find().sort({ createdAt: -1 }).limit(30).lean(),
  ]);

  const all: Array<{
    icon: string;
    title: string;
    subtitle: string;
    time: string;
    sortKey: number;
  }> = [];

  for (const r of reviews) {
    all.push({
      icon: "review",
      title: "New review submitted",
      subtitle: `${r.gameName} — Rating: ${r.rating}/5`,
      time: timeAgo(r.createdAt),
      sortKey: new Date(r.createdAt).getTime(),
    });
  }

  for (const u of users) {
    all.push({
      icon: "user",
      title: "New user registered",
      subtitle: u.name,
      time: timeAgo(u.createdAt),
      sortKey: new Date(u.createdAt).getTime(),
    });
  }

  all.sort((a, b) => b.sortKey - a.sortKey);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Activity Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {all.length} recent activities across the platform.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="divide-y divide-border">
          {all.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Pencil;
            const color = colorMap[item.icon] ?? "bg-secondary text-muted-foreground";
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{item.time}</p>
              </div>
            );
          })}
          {all.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No activity yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
