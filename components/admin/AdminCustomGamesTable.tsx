"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle, Loader2, Clock, Archive, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface CustomGameRow {
  _id: string;
  title: string;
  shortDescription: string;
  genre: string;
  status: string;
  submittedBy: { name: string; email: string } | null;
  createdAt: string;
}

interface AdminCustomGamesTableProps {
  games: CustomGameRow[];
}

const PAGE_SIZES = [10, 20, 50];
const STATUS_FILTERS = ["all", "published", "draft", "pending", "archived"] as const;

const STATUS_ACTIONS: Record<string, { label: string; value: string; icon: typeof CheckCircle; color: string; activeColor: string }[]> = {
  published: [
    { label: "Draft", value: "draft", icon: EyeOff, color: "text-muted-foreground/50", activeColor: "text-muted-foreground hover:bg-secondary" },
    { label: "Archive", value: "archived", icon: Archive, color: "text-muted-foreground/50", activeColor: "text-orange-400 hover:bg-orange-600/20" },
  ],
  draft: [
    { label: "Publish", value: "published", icon: Eye, color: "text-muted-foreground/50", activeColor: "text-green-400 hover:bg-green-600/20" },
  ],
  pending: [
    { label: "Approve", value: "published", icon: CheckCircle, color: "text-muted-foreground/50", activeColor: "text-green-400 hover:bg-green-600/20" },
    { label: "Draft", value: "draft", icon: EyeOff, color: "text-muted-foreground/50", activeColor: "text-muted-foreground hover:bg-secondary" },
    { label: "Archive", value: "archived", icon: Archive, color: "text-muted-foreground/50", activeColor: "text-orange-400 hover:bg-orange-600/20" },
  ],
  archived: [
    { label: "Restore", value: "draft", icon: Clock, color: "text-muted-foreground/50", activeColor: "text-blue-400 hover:bg-blue-600/20" },
  ],
};

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-600/30 text-green-400",
  draft: "bg-purple-600/30 text-purple-400",
  pending: "bg-yellow-600/30 text-yellow-400",
  archived: "bg-red-600/30 text-red-400",
};

export function AdminCustomGamesTable({ games }: AdminCustomGamesTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    let result = games;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          (g.submittedBy?.name ?? "").toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }
    return result;
  }, [games, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleAction = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/custom-games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Action failed.");
        return;
      }

      toast.success(data.message);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/custom-games/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Delete failed.");
        return;
      }

      toast.success(data.message);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, genre, or submitter..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {filtered.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {games.length} games
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Genre</th>
              <th className="px-4 py-3 text-left font-medium">Submitted By</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((g) => {
              const isLoading = loadingId === g._id;
              const actions = STATUS_ACTIONS[g.status] ?? [];

              return (
                <tr
                  key={g._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{g.title}</p>
                    <p className="truncate text-xs text-muted-foreground max-w-60">
                      {g.shortDescription}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{g.genre}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {g.submittedBy?.name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_BADGE[g.status] ?? "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          {actions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.value}
                                onClick={() => handleAction(g._id, action.value)}
                                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${action.activeColor}`}
                                title={action.label}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {action.label}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-600/20"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {search || statusFilter !== "all"
                    ? "No custom games match your filters."
                    : "No custom game submissions yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-border bg-card px-2 py-1 text-sm focus:outline-none"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
