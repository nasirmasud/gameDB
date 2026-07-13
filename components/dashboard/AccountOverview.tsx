"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Calendar, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

interface AccountOverviewProps {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AccountOverview({ name, email, role, createdAt }: AccountOverviewProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete account.");
        return;
      }
      toast.success("Account deleted.");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setDeleting(false);
    }
  };

  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-bold">Account Details</h2>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> Name
            </span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" /> Email
            </span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Role
            </span>
            <span className="font-medium capitalize">{role}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> Member since
            </span>
            <span className="font-medium">{memberSince}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-red-600/30 bg-card p-6">
        <h2 className="mb-2 text-lg font-bold text-red-400">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Once you delete your account, there is no going back. All your reviews,
          favorites, and custom games will be permanently removed.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm">
              Type <span className="font-bold text-red-400">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== "DELETE" || deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4" /> Confirm Delete</>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteText("");
                }}
                className="rounded-lg border border-border px-4 py-2.5 text-sm transition hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
