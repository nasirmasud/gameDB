"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  LogOut,
  MessageSquare,
  Star,
  UserPlus,
  Pencil,
  Menu,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Wifi,
  Database,
  HardDrive,
  Activity,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalCustomGames: number;
  totalReviews: number;
  totalRatings: number;
  usersByRole: Array<{ name: string; value: number; percentage: string; color: string }>;
  gamesByStatus: Array<{ name: string; value: number; percentage: string; color: string }>;
}

interface AdminActivity {
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
  users: number[];
  games: number[];
  reviews: number[];
}

interface AdminDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Skeleton className="mb-3 h-7 w-28" />
      <Skeleton className="mb-1 h-8 w-20" />
      <Skeleton className="mt-2 h-4 w-16" />
    </div>
  );
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity["activities"]>([]);
  const [chartData, setChartData] = useState<ChartResponse>({
    labels: [],
    users: [],
    games: [],
    reviews: [],
  });
  const [chartRange, setChartRange] = useState(6);
  const [loading, setLoading] = useState(true);

  const activityChartRef = useRef<HTMLCanvasElement>(null);
  const usersChartRef = useRef<HTMLCanvasElement>(null);
  const gamesChartRef = useRef<HTMLCanvasElement>(null);

  const fetchData = useCallback(async (range: number) => {
    setLoading(true);
    try {
      const [s, a, c] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()),
        fetch("/api/admin/activity").then((r) => r.json()),
        fetch(`/api/admin/charts?range=${range}`).then((r) => r.json()),
      ]);
      setStats(s as AdminStats);
      setActivities((a as AdminActivity).activities ?? []);
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
    if (
      loading ||
      !stats ||
      chartData.labels.length === 0
    )
      return;

    Chart.defaults.color = "#8892a6";
    Chart.defaults.font.family =
      "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif";

    const activityCtx = activityChartRef.current;
    const usersCtx = usersChartRef.current;
    const gamesCtx = gamesChartRef.current;

    const activityChart = activityCtx
      ? new Chart(activityCtx, {
          type: "line",
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: "Users",
                data: chartData.users,
                borderColor: "#22c55e",
                backgroundColor: "#22c55e",
                tension: 0.4,
                pointRadius: 3,
              },
              {
                label: "Games",
                data: chartData.games,
                borderColor: "#a855f7",
                backgroundColor: "#a855f7",
                tension: 0.4,
                pointRadius: 3,
              },
              {
                label: "Reviews",
                data: chartData.reviews,
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
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
                ticks: {
                  callback(value) {
                    if (typeof value === "number" && value >= 1000) {
                      return value / 1000 + "K";
                    }
                    return value;
                  },
                },
              },
              x: { grid: { display: false } },
            },
          },
        })
      : null;

    const usersChart = usersCtx
      ? new Chart(usersCtx, {
          type: "doughnut",
          data: {
            labels: stats.usersByRole.map((r) => r.name),
            datasets: [
              {
                data: stats.usersByRole.map((r) => r.value),
                backgroundColor: stats.usersByRole.map((r) => r.color),
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

    const gamesChart = gamesCtx
      ? new Chart(gamesCtx, {
          type: "doughnut",
          data: {
            labels: stats.gamesByStatus.map((r) => r.name),
            datasets: [
              {
                data: stats.gamesByStatus.map((r) => r.value),
                backgroundColor: stats.gamesByStatus.map((r) => r.color),
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

    return () => {
      activityChart?.destroy();
      usersChart?.destroy();
      gamesChart?.destroy();
    };
  }, [loading, stats, chartData]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-5 lg:flex flex-col gap-1">
          <Skeleton className="mb-3 h-10" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9" />
          ))}
          <Skeleton className="mt-auto h-40" />
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <Skeleton className="mb-2 h-8 w-72" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="h-72" />
        </main>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-green-600/30 text-green-400",
      href: "/admin/dashboard/users",
    },
    {
      label: "Total Games",
      value: stats?.totalGames ?? 0,
      icon: Gamepad2,
      color: "bg-purple-600/30 text-purple-400",
      href: "/admin/dashboard/games",
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: MessageSquare,
      color: "bg-blue-600/30 text-blue-400",
      href: "/admin/dashboard/reviews",
    },
    {
      label: "Total Ratings",
      value: stats?.totalRatings ?? 0,
      icon: Star,
      color: "bg-yellow-600/30 text-yellow-400",
      href: "/admin/dashboard/reviews",
    },
    {
      label: "Custom Games",
      value: stats?.totalCustomGames ?? 0,
      icon: Gamepad2,
      color: "bg-cyan-600/30 text-cyan-400",
      href: "/admin/dashboard/custom-games",
    },
  ];

  const activityIconMap: Record<string, typeof MessageSquare> = {
    review: MessageSquare,
    user: UserPlus,
  };

  return (
    <div className="flex min-h-screen w-full">
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
        } w-64 shrink-0 flex-col gap-1 border-r border-border bg-card p-5 lg:relative lg:flex lg:inset-auto lg:z-auto`}
      >
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2.5 font-medium text-white mb-3"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-3">
          <button
            onClick={() => setUsersOpen(!usersOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-muted-foreground hover:bg-secondary"
          >
            <span className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              Users
            </span>
            <span className={`text-xs transition ${usersOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </button>
          {usersOpen && (
            <div className="ml-8 mt-1 flex flex-col gap-0.5 text-sm text-muted-foreground">
              <Link
                href="/admin/dashboard/users"
                className="rounded-lg px-3 py-1.5 hover:bg-secondary hover:text-foreground"
              >
                All Users
              </Link>
              <Link
                href="/admin/dashboard/roles"
                className="rounded-lg px-3 py-1.5 hover:bg-secondary hover:text-foreground"
              >
                Roles &amp; Permissions
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/admin/dashboard/custom-games"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          <Gamepad2 className="h-4 w-4" />
          Custom Games
        </Link>

        <div className="mt-3 border-t border-border pt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <p className="mb-1.5 text-sm font-semibold text-foreground">
            Manage your gaming platform with ease.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Add content, manage users and keep your community engaged.
          </p>
          <div className="flex justify-center">
            <Gamepad2 className="h-8 w-8 text-primary" />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center rounded-lg border border-border bg-secondary px-3 py-2 text-sm lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              Welcome back, {user.name ?? "Admin"}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {card.label}
                </p>
                <p className="mb-1 text-2xl font-bold">{card.value.toLocaleString()}</p>
                <Link
                  href={card.href}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:underline"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          <div className="flex flex-col gap-6 min-w-0">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Platform Activity Overview</h2>
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
                  <span className="h-2 w-2 rounded-full bg-green-500" /> Users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Games
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Reviews
                </span>
              </div>
              <div className="h-72">
                <canvas ref={activityChartRef} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <h2 className="mb-4 text-lg font-bold">Users by Role</h2>
                <div className="flex items-center gap-6">
                  <div className="relative h-32 w-32 shrink-0">
                    <canvas ref={usersChartRef} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold">
                        {stats?.totalUsers.toLocaleString() ?? "0"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm">
                    {(stats?.usersByRole ?? []).map((r) => (
                      <span key={r.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        {r.name}{" "}
                        <span className="ml-auto text-muted-foreground">
                          {r.value.toLocaleString()} ({r.percentage}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <Link
                  href="/admin/dashboard/custom-games"
                  className="mb-4 block text-lg font-bold hover:underline"
                >
                  Games by Status
                </Link>
                <div className="flex items-center gap-6">
                  <div className="relative h-32 w-32 shrink-0">
                    <canvas ref={gamesChartRef} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-lg font-bold">
                        {stats?.totalCustomGames.toLocaleString() ?? "0"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm">
                    {(stats?.gamesByStatus ?? []).map((r) => (
                      <span key={r.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: r.color }}
                        />
                        {r.name}{" "}
                        <span className="ml-auto text-muted-foreground">
                          {r.value.toLocaleString()} ({r.percentage}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-bold">Recent Activity</h2>
              <div className="flex flex-col gap-4">
                {(activities.length > 0 ? activities : []).map((item, i) => {
                  const Icon = activityIconMap[item.icon] ?? Pencil;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${item.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium leading-tight">{item.title}</p>
                        <p className="text-sm leading-tight text-muted-foreground">
                          {item.subtitle}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                )}
              </div>
              <Link
                href="/admin/dashboard/activity"
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm transition hover:bg-secondary"
              >
                View All Activity <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-bold">System Health</h2>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wifi className="h-4 w-4" /> Server Status
                  </span>
                  <span className="font-medium text-green-400">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" /> Database
                  </span>
                  <span className="font-medium text-green-400">Operational</span>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <HardDrive className="h-4 w-4" /> Storage Usage
                    </span>
                    <span className="text-muted-foreground">68%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-green-500" style={{ width: "68%" }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-4 w-4" /> Bandwidth
                    </span>
                    <span className="text-muted-foreground">42%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
              <Link
                href="/admin/dashboard/status"
                className="mt-5 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm transition hover:bg-secondary"
              >
                View System Status <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
