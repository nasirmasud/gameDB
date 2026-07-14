"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Heart,
  LogOut,
  Menu,
  Star,
  Pencil,
  Bell,
  Settings,
  User,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  UserPlus,
} from "lucide-react";

interface UserStats {
  totalWishlist: number;
  totalReviews: number;
  totalRatings: number;
  reviewsByStatus: Array<{
    name: string;
    value: number;
    percentage: string;
    color: string;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    color: string;
  }>;
}

interface UserActivity {
  activities: Array<{
    icon: string;
    color: string;
    title: string;
    subtitle: string;
    time: string;
  }>;
}

interface ChartResponse {
  labels: string[];
  reviews: number[];
  ratings: number[];
  wishlist: number[];
}

interface DashboardContentProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: string | null;
  };
}

const initials = (name?: string | null, email?: string | null) =>
  (name ?? email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function formatMemberSince(iso?: string | null): string {
  if (!iso) return "Member";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity["activities"]>([]);
  const [chartData, setChartData] = useState<ChartResponse>({
    labels: [],
    reviews: [],
    ratings: [],
    wishlist: [],
  });
  const [chartRange, setChartRange] = useState(6);
  const [loading, setLoading] = useState(true);

  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const reviewsChartRef = useRef<HTMLCanvasElement>(null);
  const ratingsChartRef = useRef<HTMLCanvasElement>(null);

  const fetchData = useCallback(async (range: number) => {
    setLoading(true);
    try {
      const [s, a, c] = await Promise.all([
        fetch("/api/user/stats").then((r) => r.json()),
        fetch("/api/user/activity").then((r) => r.json()),
        fetch(`/api/user/charts?range=${range}`).then((r) => r.json()),
      ]);
      setStats(s as UserStats);
      setActivities((a as UserActivity).activities ?? []);
      setChartData(c as ChartResponse);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(chartRange);
  }, [fetchData, chartRange]);

  useEffect(() => {
    if (loading || !stats || chartData.labels.length === 0) return;

    Chart.defaults.color = "#8892a6";
    Chart.defaults.font.family =
      "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";

    const activityCtx = activityChartRef.current;
    const reviewsCtx = reviewsChartRef.current;
    const ratingsCtx = ratingsChartRef.current;

    const activityChart = activityCtx
      ? new Chart(activityCtx, {
          type: "line",
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: "Reviews",
                data: chartData.reviews,
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
                tension: 0.4,
                pointRadius: 3,
              },
              {
                label: "Ratings",
                data: chartData.ratings,
                borderColor: "#a855f7",
                backgroundColor: "#a855f7",
                tension: 0.4,
                pointRadius: 3,
              },
              {
                label: "Wishlist",
                data: chartData.wishlist,
                borderColor: "#ef4444",
                backgroundColor: "#ef4444",
                tension: 0.4,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "#232b3d" },
                ticks: { stepSize: 5 },
              },
              x: { grid: { display: false } },
            },
          },
        })
      : null;

    const reviewsChart = reviewsCtx
      ? new Chart(reviewsCtx, {
          type: "doughnut",
          data: {
            labels: stats.reviewsByStatus.map((r) => r.name),
            datasets: [
              {
                data: stats.reviewsByStatus.map((r) => r.value),
                backgroundColor: stats.reviewsByStatus.map((r) => r.color),
                borderColor: "#131926",
                borderWidth: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: { legend: { display: false } },
          },
        })
      : null;

    const ratingsChart = ratingsCtx && stats.ratingDistribution
      ? new Chart(ratingsCtx, {
          type: "bar",
          data: {
            labels: stats.ratingDistribution.map((r) => `${r.rating}★`),
            datasets: [
              {
                label: "Reviews",
                data: stats.ratingDistribution.map((r) => r.count),
                backgroundColor: stats.ratingDistribution.map((r) => r.color),
                borderColor: stats.ratingDistribution.map((r) => r.color),
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "#232b3d" },
                ticks: { stepSize: 1 },
              },
              x: { grid: { display: false } },
            },
          },
        })
      : null;

    return () => {
      activityChart?.destroy();
      reviewsChart?.destroy();
      ratingsChart?.destroy();
    };
  }, [loading, stats, chartData]);

  const activityIconMap: Record<string, typeof MessageSquare> = {
    review: MessageSquare,
    wishlist: Heart,
    user: UserPlus,
  };

  return (
    <div className="flex w-full">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-50 flex"
            : "hidden"
        } w-64 shrink-0 flex-col gap-6 border-r border-border bg-background p-5 lg:relative lg:flex lg:inset-auto lg:z-auto`}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback className="bg-secondary text-sm font-semibold">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {user.name ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/20 px-3 py-2.5 font-medium text-foreground"
          >
            <span className="text-base">▦</span> Dashboard
          </Link>
          <Link
            href="/user/dashboard/favorites"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
          >
            <Heart className="h-4 w-4" /> Wishlist
          </Link>

          <div className="mt-3">
            <Link
              href="/user/dashboard/reviews"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
            >
              <Pencil className="h-4 w-4" /> Reviews
            </Link>
            <div className="ml-8 mt-1 flex flex-col gap-0.5 text-muted-foreground">
              {(stats?.reviewsByStatus ?? []).map((s) => (
                <span
                  key={s.name}
                  className="rounded-lg px-3 py-1.5 text-sm hover:bg-secondary hover:text-foreground"
                >
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/user/dashboard/custom-games"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
          >
            <span className="text-base">🎮</span> Custom Games
          </Link>

          <div className="mt-3 flex flex-col gap-1">
            <Link
              href="/user/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              href="/user/dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Link
              href="/user/dashboard/notifications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
            >
              <Bell className="h-4 w-4" /> Notifications
            </Link>
            <Link
              href="/user/dashboard/account"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-secondary"
            >
              <User className="h-4 w-4" /> Account
            </Link>
          </div>
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>

        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <p className="mb-1.5 text-sm font-semibold">
            Track, rate &amp; review
          </p>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            your favorite games and share your experience with the community.
          </p>
          <div className="flex justify-center">
            <span className="text-3xl">🎮</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center rounded-lg border border-border bg-secondary px-3 py-2 text-sm lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Welcome back, {user.name ?? "there"}! 👋
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Here&apos;s what&apos;s happening with your gaming journey.
              </p>
            </div>
          </div>
          <Link
            href={`/user/dashboard/${user.id}`}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            View Public Profile <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-600/30 text-pink-400">
                <Heart className="h-3.5 w-3.5" />
              </span>
              Wishlist
            </p>
            <p className="mb-1 text-2xl font-bold">
              {stats?.totalWishlist ?? 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                Games
              </span>
            </p>
            <Link
              href="/user/dashboard/favorites"
              className="flex items-center gap-1 text-sm text-blue-400 hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400">
                <Pencil className="h-3.5 w-3.5" />
              </span>
              Reviews &amp; Ratings
            </p>
            <p className="mb-1 text-2xl font-bold">
              {stats?.totalReviews ?? 0}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                Total
              </span>
            </p>
            <Link
              href="/user/dashboard/reviews"
              className="flex items-center gap-1 text-sm text-blue-400 hover:underline"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Activity Overview</h2>
                <select
                  value={chartRange}
                  onChange={(e) => setChartRange(Number(e.target.value))}
                  className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm focus:outline-none"
                >
                  <option value={3}>Last 3 Months</option>
                  <option value={6}>Last 6 Months</option>
                  <option value={12}>Last Year</option>
                </select>
              </div>
              <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Reviews
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Ratings
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Wishlist
                </span>
              </div>
              <div className="h-64">
                <canvas ref={activityChartRef} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <h2 className="mb-4 text-lg font-bold">Reviews by Status</h2>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-72 w-72 shrink-0">
                    <canvas ref={reviewsChartRef} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold">
                        {stats?.totalReviews ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-sm">
                    {(stats?.reviewsByStatus ?? []).map((s) => (
                      <span key={s.name} className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                        <span className="text-muted-foreground">
                          {s.value} ({s.percentage}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <h2 className="mb-4 text-lg font-bold">Rating Distribution</h2>
                <div className="flex flex-col gap-4">
                  <div className="h-40">
                    <canvas ref={ratingsChartRef} />
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    {(stats?.ratingDistribution ?? []).map((r) => (
                      <div key={r.rating} className="flex items-center gap-2">
                        <span className="w-8 text-muted-foreground">{r.rating}★</span>
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${stats?.totalReviews ? (r.count / stats.totalReviews) * 100 : 0}%`,
                                backgroundColor: r.color,
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                      </div>
                    ))}
                    {(stats?.ratingDistribution ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">No ratings yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-bold">Recent Activity</h2>
              <div className="flex flex-col gap-4">
                {activities.length > 0
                  ? activities.map((item, i) => {
                      const Icon = activityIconMap[item.icon] ?? Pencil;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${item.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {item.title}
                            </p>
                            <p className="text-sm leading-tight text-muted-foreground">
                              {item.subtitle}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  : Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="mb-1 h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
              </div>
              <Link
                href="/user/dashboard/activity"
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm transition hover:bg-secondary"
              >
                View All Activity <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-1.5 text-lg font-bold">Need Help?</h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Check out our Help Center for guides and FAQs.
              </p>
              <Link
                href="/"
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm transition hover:bg-secondary"
              >
                Visit Help Center <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
