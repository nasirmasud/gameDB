"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Search, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GameImage } from "@/components/admin/GameImage";

interface FavoriteRow {
  _id: string;
  gameId: number;
  gameName: string;
  gameImage: string | null;
  gameRating: number | null;
  genre: string | null;
  platforms: string | null;
  publishers: string | null;
  createdAt: string;
}

const PAGE_SIZES = [10, 20, 50];

export function UserFavoritesTable({ favorites: initialFavorites }: { favorites: FavoriteRow[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(gameId: number, _id: string) {
    setRemoving(_id);
    try {
      const res = await fetch(`/api/user/favorites?gameId=${gameId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFavorites((prev) => prev.filter((f) => f._id !== _id));
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Failed to remove.");
    } finally {
      setRemoving(null);
      setConfirmRemoveId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return favorites;
    const q = search.toLowerCase();
    return favorites.filter((f) => f.gameName.toLowerCase().includes(q));
  }, [favorites, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {filtered.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {filtered.length} of {favorites.length} games
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="w-[20%] px-2 py-3 text-left font-medium">Game</th>
              <th className="w-[16%] px-2 py-3 text-left font-medium">Genre</th>
              <th className="w-[18%] px-2 py-3 text-left font-medium">Platforms</th>
              <th className="w-[16%] px-2 py-3 text-left font-medium">Publisher</th>
              <th className="w-[10%] px-2 py-3 text-center font-medium">Rating</th>
              <th className="w-[12%] px-2 py-3 text-left font-medium">Saved</th>
              <th className="w-[8%] px-2 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((f) => (
              <tr key={f._id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-2 py-3 truncate">
                  <Link href={`/games/${f.gameId}`} className="flex items-center gap-2 hover:text-primary">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-secondary">
                      <GameImage src={f.gameImage} alt={f.gameName} />
                    </div>
                    <span className="truncate font-medium">{f.gameName}</span>
                  </Link>
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {f.genre ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {f.platforms ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {f.publishers ?? <span className="text-muted-foreground/50">&mdash;</span>}
                </td>
                <td className="px-2 py-3 text-center">
                  {f.gameRating != null ? (
                    <span className="inline-flex items-center gap-1 text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" /> {f.gameRating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>
                <td className="truncate px-2 py-3 text-muted-foreground">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-3 text-center">
                  <button
                    onClick={() => setConfirmRemoveId(f._id)}
                    disabled={removing === f._id}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 transition hover:bg-red-600/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? "No games match your search." : "No favorites yet."}
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

      {confirmRemoveId && (() => {
        const fav = favorites.find((f) => f._id === confirmRemoveId);
        if (!fav) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
            <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
              <h3 className="mb-2 text-lg font-bold">Remove from Wishlist</h3>
              <p className="mb-5 text-sm text-muted-foreground">
                Are you sure you want to remove <span className="font-medium text-foreground">{fav.gameName}</span> from your wishlist?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  disabled={removing === confirmRemoveId}
                  className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemove(fav.gameId, fav._id)}
                  disabled={removing === confirmRemoveId}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  {removing === confirmRemoveId ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
                  ) : (
                    <><Trash2 className="h-4 w-4" /> Remove</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
