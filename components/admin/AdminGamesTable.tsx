"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GameImage } from "@/components/admin/GameImage";
import { Star, MessageSquare, BookmarkCheck, Search } from "lucide-react";

interface GameRow {
  gameId: number;
  name: string;
  reviewCount: number;
  avgRating: number;
  favoriteCount: number;
  total: number;
  image: string | null;
}

interface AdminGamesTableProps {
  games: GameRow[];
}

export function AdminGamesTable({ games }: AdminGamesTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return games;
    const q = search.toLowerCase();
    return games.filter((g) => g.name.toLowerCase().includes(q));
  }, [games, search]);

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Game</th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> Reviews</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Avg Rating</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">
                <span className="inline-flex items-center gap-1"><BookmarkCheck className="h-3.5 w-3.5" /> Favorites</span>
              </th>
              <th className="px-4 py-3 text-center font-medium">Total Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.gameId} className="border-b border-border last:border-0 hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <Link href={`/games/${g.gameId}`} className="flex items-center gap-3 hover:text-primary">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                      <GameImage src={g.image} alt={g.name} />
                    </div>
                    <span className="font-medium">{g.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">{g.reviewCount}</td>
                <td className="px-4 py-3 text-center">
                  {g.avgRating > 0 ? (
                    <span className="inline-flex items-center gap-1 text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" /> {g.avgRating}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{g.favoriteCount}</td>
                <td className="px-4 py-3 text-center font-medium">{g.total}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? "No games match your search." : "No games with activity yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
