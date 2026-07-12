"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckCircle, Loader2, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ReviewRow {
  _id: string;
  gameId: number;
  gameName: string;
  userName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

interface AdminReviewsTableProps {
  reviews: ReviewRow[];
}

const PAGE_SIZES = [10, 20, 50];
const STATUS_FILTERS = ["all", "approved", "pending", "rejected"] as const;

export function AdminReviewsTable({ reviews }: AdminReviewsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    let result = reviews;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.gameName.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [reviews, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleAction = async (id: string, action: "approved" | "pending" | "rejected" | "delete") => {
    setLoadingId(id);
    try {
      const url = `/api/admin/reviews/${id}`;
      const options: RequestInit =
        action === "delete"
          ? { method: "DELETE" }
          : {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: action }),
            };

      const res = await fetch(url, options);
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

  const statusColors: Record<string, string> = {
    approved: "text-green-400",
    pending: "text-yellow-400",
    rejected: "text-red-400",
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search game, user, or comment..."
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
            {filtered.length} of {reviews.length} reviews
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Game</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-center font-medium">Rating</th>
              <th className="px-4 py-3 text-left font-medium">Comment</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => {
              const isLoading = loadingId === r._id;
              return (
                <tr
                  key={r._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/games/${r.gameId}`}
                      className="font-medium hover:text-primary"
                    >
                      {r.gameName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.userName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}/5
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {r.comment}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-medium capitalize ${statusColors[r.status] ?? "text-muted-foreground"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleAction(r._id, "approved")}
                        disabled={isLoading || r.status === "approved"}
                        title="Approve"
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
                          r.status === "approved"
                            ? "cursor-not-allowed text-green-400/50"
                            : "text-green-400 hover:bg-green-600/20"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r._id, "pending")}
                        disabled={isLoading || r.status === "pending"}
                        title="Set as pending"
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition ${
                          r.status === "pending"
                            ? "cursor-not-allowed text-yellow-400/50"
                            : "text-yellow-400 hover:bg-yellow-600/20"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5" />
                        )}
                        Pending
                      </button>
                      <button
                        onClick={() => handleAction(r._id, "delete")}
                        disabled={isLoading}
                        title="Delete review"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-600/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {search || statusFilter !== "all"
                    ? "No reviews match your filters."
                    : "No reviews yet."}
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
