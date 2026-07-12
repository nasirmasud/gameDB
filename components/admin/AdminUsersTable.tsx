"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, Ban, User as UserIcon, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  reviewCount: number;
  favoriteCount: number;
}

interface AdminUsersTableProps {
  users: UserRow[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleBanToggle = async (u: UserRow) => {
    setLoadingId(u._id);
    try {
      const res = await fetch(`/api/admin/users/${u._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !u.isBanned }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to update user.");
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
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete user.");
        return;
      }

      toast.success(
        `User deleted along with ${data.deletedReviews} reviews, ${data.deletedFavorites} favorites, ${data.deletedCustomGames} custom games.`,
        { duration: 5000 },
      );
      setConfirmDeleteId(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoadingId(null);
    }
  };

  const confirmUser = users.find((u) => u._id === confirmDeleteId);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-center font-medium">Reviews</th>
              <th className="px-4 py-3 text-center font-medium">Favorites</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isAdmin = u.role === "admin";
              const isLoading = loadingId === u._id;
              return (
                <tr
                  key={u._id}
                  className="border-b border-border last:border-0 hover:bg-secondary/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-600/30 px-2 py-0.5 text-xs font-medium text-purple-400">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-600/30 px-2 py-0.5 text-xs font-medium text-blue-400">
                        <UserIcon className="h-3 w-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{u.reviewCount}</td>
                  <td className="px-4 py-3 text-center">{u.favoriteCount}</td>
                  <td className="px-4 py-3 text-center">
                    {u.isBanned ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-600/30 px-2 py-0.5 text-xs font-medium text-red-400">
                        <Ban className="h-3 w-3" /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-green-600/30 px-2 py-0.5 text-xs font-medium text-green-400">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {!isAdmin && (
                        <>
                          <button
                            onClick={() => handleBanToggle(u)}
                            disabled={isLoading}
                            title={u.isBanned ? "Unban user" : "Ban user"}
                            className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium transition ${
                              u.isBanned
                                ? "text-green-400 hover:bg-green-600/20"
                                : "text-yellow-400 hover:bg-yellow-600/20"
                            }`}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.isBanned ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>

                          <button
                            onClick={() => setConfirmDeleteId(u._id)}
                            disabled={isLoading}
                            title="Delete user"
                            className="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-600/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmDeleteId && confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-bold">Delete User</h3>
            <p className="mb-1 text-sm text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-foreground">{confirmUser.name}</span>?
            </p>
            <p className="mb-5 text-xs text-muted-foreground">
              This will also remove their{" "}
              <span className="font-medium">{confirmUser.reviewCount}</span> reviews,{" "}
              <span className="font-medium">{confirmUser.favoriteCount}</span> favorites,
              and any custom games. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={loadingId === confirmDeleteId}
                className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={loadingId === confirmDeleteId}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {loadingId === confirmDeleteId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
