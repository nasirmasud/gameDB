"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AddCustomGameModal } from "./AddCustomGameModal";

interface CustomGameRow {
  _id: string;
  title: string;
  shortDescription: string;
  genre: string;
  status: string;
  createdAt: string;
}

const PAGE_SIZES = [10, 20, 50];
const STATUS_FILTERS = ["all", "published", "draft", "pending", "archived"] as const;

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-600/30 text-green-400",
  draft: "bg-purple-600/30 text-purple-400",
  pending: "bg-yellow-600/30 text-yellow-400",
  archived: "bg-red-600/30 text-red-400",
};

export function UserCustomGamesTable({ games: initialGames }: { games: CustomGameRow[] }) {
  const [games, setGames] = useState(initialGames);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/user/custom-games/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setGames((prev) => prev.filter((g) => g._id !== id));
      toast.success("Game deleted.");
    } catch {
      toast.error("Failed to delete game.");
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  }

  const filtered = useMemo(() => {
    let result = games;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }
    return result;
  }, [games, search, statusFilter]);

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
              placeholder="Search by title or genre..."
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
              <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Game
        </button>
        {filtered.length > 0 && (
          <span className="text-sm text-muted-foreground">{filtered.length} of {games.length} games</span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="w-[40%] px-4 py-3 text-left font-medium">Title</th>
              <th className="w-[20%] px-4 py-3 text-left font-medium">Genre</th>
              <th className="w-[15%] px-4 py-3 text-center font-medium">Status</th>
              <th className="w-[15%] px-4 py-3 text-left font-medium">Date</th>
              <th className="w-[10%] px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((g) => (
              <tr key={g._id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <p className="font-medium">{g.title}</p>
                  <p className="truncate text-xs text-muted-foreground max-w-60">{g.shortDescription}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{g.genre}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[g.status] ?? "bg-secondary text-muted-foreground"}`}>
                    {g.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {new Date(g.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setConfirmDeleteId(g._id)}
                    disabled={deleting === g._id}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-600/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {search || statusFilter !== "all" ? "No games match your filters." : "No custom game submissions yet."}
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

      {showModal && (
        <AddCustomGameModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            window.location.reload();
          }}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-bold">Delete Custom Game</h3>
            <p className="mb-5 text-sm text-muted-foreground">
              Are you sure you want to delete this custom game? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting === confirmDeleteId}
                className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting === confirmDeleteId}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {deleting === confirmDeleteId ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
