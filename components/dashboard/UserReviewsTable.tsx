"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ReviewRow {
  _id: string;
  gameId: number;
  gameName: string;
  gameImage: string | null;
  rating: number;
  comment: string;
  status: string;
  genre: string | null;
  platforms: string | null;
  publishers: string | null;
  createdAt: string;
}

const PAGE_SIZES = [10, 20, 50];
const STATUS_FILTERS = ["all", "approved", "pending", "rejected"] as const;

const STATUS_COLORS: Record<string, string> = {
  approved: "text-green-400",
  pending: "text-yellow-400",
  rejected: "text-red-400",
};

export function UserReviewsTable({ reviews: initialReviews }: { reviews: ReviewRow[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    let result = initialReviews;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.gameName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [initialReviews, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search game or comment..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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
            {filtered.length} of {initialReviews.length} reviews
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="w-[18%] px-2 py-3 text-left font-medium">Game</th>
              <th className="w-[15%] px-2 py-3 text-left font-medium">Genre</th>
              <th className="w-[18%] px-2 py-3 text-left font-medium">Platforms</th>
              <th className="w-[15%] px-2 py-3 text-left font-medium">Publisher</th>
              <th className="w-[10%] px-2 py-3 text-center font-medium">Rating</th>
              <th className="w-[8%] px-2 py-3 text-center font-medium">Status</th>
              <th className="w-[8%] px-2 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr key={r._id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-2 py-3 truncate">
                  <Link href={`/games/${r.gameId}`} className="flex items-center gap-2 hover:text-primary">
                    {r.gameImage && (
                      <img src={r.gameImage} alt={r.gameName} className="h-24 w-20 shrink-0 rounded object-cover" />
                    )}
                    <span className="truncate font-medium">{r.gameName}</span>
                  </Link>
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {r.genre ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {r.platforms ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {r.publishers ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="px-2 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-yellow-400">
                    <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}/5
                  </span>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className={`text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? ""}`}>{r.status}</span>
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "No reviews match your filters." : "No reviews yet."}
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
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded border border-border bg-card px-2 py-1 text-sm focus:outline-none"
            >
              {PAGE_SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}
                className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages}
                className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:bg-secondary disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
